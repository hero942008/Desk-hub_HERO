package app.revanced.extension.gamehub.explore;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.util.LruCache;
import android.widget.ImageView;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Ultra-optimized async image loader with zero main-thread overhead:
 * - Direct inSampleSize downsampled decoding (RGB_565/ARGB_8888) to minimize RAM & GC spikes.
 * - Non-blocking priority thread pool pegged at low-priority background workers.
 * - LruCache with automatic byte-size bounds.
 * - Tagged view recycling guard to eliminate redundant UI invalidation.
 */
final class BhImageLoader {

    private static final String TAG = "BhExplore";

    private static final ThreadPoolExecutor POOL = new ThreadPoolExecutor(
        2, 4, 30L, TimeUnit.SECONDS,
        new LinkedBlockingQueue<Runnable>(128),
        new ThreadFactory() {
            private final AtomicInteger count = new AtomicInteger(1);
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "BhImgWorker-" + count.getAndIncrement());
                t.setPriority(Thread.NORM_PRIORITY - 2); // Background priority for zero UI jitter
                t.setDaemon(true);
                return t;
            }
        },
        new ThreadPoolExecutor.DiscardOldestPolicy()
    );

    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    // Max 12% of available runtime memory or 16MB ceiling
    private static final int MAX_CACHE_BYTES = Math.min(
        (int) (Runtime.getRuntime().maxMemory() / 8),
        16 * 1024 * 1024
    );

    private static final LruCache<String, Bitmap> CACHE =
        new LruCache<String, Bitmap>(MAX_CACHE_BYTES) {
            @Override protected int sizeOf(String key, Bitmap value) {
                return value != null ? value.getByteCount() : 0;
            }
        };

    private BhImageLoader() { }

    static void load(final ImageView target, final String url) {
        if (target == null || url == null || url.isEmpty()) return;

        // Guard against view recycling: remember what THIS view wants.
        target.setTag(url);

        Bitmap cached = CACHE.get(url);
        if (cached != null && !cached.isRecycled()) {
            target.setImageBitmap(cached);
            return;
        }

        POOL.execute(new Runnable() {
            @Override public void run() {
                final Bitmap bmp = fetchAndDecodeOptimized(url, 480, 270);
                if (bmp == null) return;
                CACHE.put(url, bmp);
                MAIN.post(new Runnable() {
                    @Override public void run() {
                        // Only apply if the view is still asking for this URL.
                        if (url.equals(target.getTag())) {
                            target.setImageBitmap(bmp);
                        }
                    }
                });
            }
        });
    }

    private static Bitmap fetchAndDecodeOptimized(String url, int reqWidth, int reqHeight) {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);
            conn.setInstanceFollowRedirects(true);
            conn.connect();
            if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) return null;

            byte[] bytes;
            try (InputStream in = conn.getInputStream()) {
                ByteArrayOutputStream out = new ByteArrayOutputStream(16384);
                byte[] buf = new byte[8192];
                int read;
                while ((read = in.read(buf)) != -1) {
                    out.write(buf, 0, read);
                }
                bytes = out.toByteArray();
            }

            if (bytes == null || bytes.length == 0) return null;

            // Step 1: Decode bounds only
            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(bytes, 0, bytes.length, opts);

            // Step 2: Calculate inSampleSize to downscale and save memory
            opts.inSampleSize = calculateInSampleSize(opts, reqWidth, reqHeight);
            opts.inJustDecodeBounds = false;
            opts.inPreferredConfig = Bitmap.Config.RGB_565; // 50% RAM savings vs ARGB_8888

            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length, opts);
        } catch (Throwable t) {
            Log.d(TAG, "image load failed: " + url + " (" + t.getMessage() + ")");
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int halfHeight = height / 2;
            final int halfWidth = width / 2;
            while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }
        return inSampleSize;
    }
}
