package app.revanced.patches.gamehub.explore

import app.revanced.patcher.patch.resourcePatch
import app.revanced.patches.gamehub.GAMEHUB_PACKAGE
import app.revanced.patches.gamehub.GAMEHUB_VERSION

// =========================================================================
// Ships the Explore screen's card artwork into res/drawable. v1 = the GOG
// logo (bh_explore_gog.png, GOG Galaxy icon). BannerExploreActivity resolves it at runtime
// via Resources.getIdentifier("bh_explore_gog", "drawable", pkgName) — the
// compile-time R class belongs to the foreign GameHub package — and the card's
// JSON manifest references it by name in its "icon" field. Mirrors
// BannerToolsDrawablesPatch's copy mechanism. If a future card names an icon
// that isn't shipped, BannerExploreActivity falls back to an accent-colour
// placeholder (never crashes).
// =========================================================================

private const val DRAWABLE_DIR = "res/drawable"
private const val ASSETS_DIR = "assets"
private const val ASSETS_EXPLORE_DIR = "assets/explore"

// resource path (in the patch bundle) -> destination drawable file name
private val DRAWABLES = mapOf(
    "explore/bh_explore_gog.png" to "bh_explore_gog.png",
    "explore/bh_explore_logo.png" to "bh_explore_logo.png",
)

// Sentinel for classloader access — same trick as BannerToolsDrawablesPatch.
private object ExploreDrawableResources

@Suppress("unused")
val exploreDrawablesPatch = resourcePatch(
    name = "Explore drawables",
    description = "Adds the Explore screen's card artwork to res/drawable and assets, rendered by BannerExploreActivity.",
) {
    compatibleWith(GAMEHUB_PACKAGE(GAMEHUB_VERSION))

    apply {
        val classLoader = ExploreDrawableResources::class.java.classLoader
            ?: error("classloader unavailable for explore drawables")

        for ((resource, fileName) in DRAWABLES) {
            // Write to res/drawable
            classLoader.getResourceAsStream(resource)?.use { input ->
                val destFile = get("$DRAWABLE_DIR/$fileName")
                destFile.parentFile?.mkdirs()
                destFile.outputStream().use { input.copyTo(it) }
            }
            // Write to assets/
            classLoader.getResourceAsStream(resource)?.use { input ->
                val destFile = get("$ASSETS_DIR/$fileName")
                destFile.parentFile?.mkdirs()
                destFile.outputStream().use { input.copyTo(it) }
            }
            // Write to assets/explore/
            classLoader.getResourceAsStream(resource)?.use { input ->
                val destFile = get("$ASSETS_EXPLORE_DIR/$fileName")
                destFile.parentFile?.mkdirs()
                destFile.outputStream().use { input.copyTo(it) }
            }
        }
    }
}
