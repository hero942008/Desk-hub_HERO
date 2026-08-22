package app.revanced.patches.gamehub.icon

import app.revanced.patcher.patch.resourcePatch
import app.revanced.patches.gamehub.GAMEHUB_PACKAGE
import app.revanced.patches.gamehub.GAMEHUB_VERSION

// =========================================================================
// Comprehensive Icon & Branding Replacement for DeskHub / BannerHub:
//
//   1. Full Adaptive-Icon Foreground across ALL density buckets:
//      Deploys ic_launcher_foreground.png to drawable-*, mipmap-*, and
//      drawable/ to prevent density-resolution fallback on non-xxxhdpi
//      displays or pre-install package parsers.
//   2. Legacy & Pre-Installation Composite Icons:
//      Deploys ic_launcher.png and ic_launcher_round.png to all mipmap-*
//      and drawable-* buckets. Fixes Android PackageInstaller rendering
//      a solid blue placeholder on pre-install confirmation screens.
//   3. Neutral Dark Background Vector:
//      Overwrites ic_launcher_background.xml with a dark modern viewport
//      so any launcher or installer showing the background layer renders
//      a clean, high-contrast dark frame rather than a harsh blue block.
//   4. In-App Branding Assets:
//      wine_logo, auth landscape/overseas logos, and splash screen banner.
// =========================================================================

private const val FOREGROUND_RESOURCE = "bannerhub-icon/ic_launcher_foreground.png"
private const val COMPOSITE_ICON_RESOURCE = "bannerhub-icon/ic_launcher.png"
private const val WINE_LOGO_RESOURCE  = "bannerhub-icon/wine_logo.png"

private const val AUTH_DRAWABLE_PREFIX =
    "assets/composeResources/com.xiaoji.egggame.features.auth/drawable"

private const val AUTH_LANDSCAPE_RESOURCE = "bannerhub-icon/features_auth_ic_logo_landscape.png"
private const val AUTH_LANDSCAPE_DEST     = "$AUTH_DRAWABLE_PREFIX/features_auth_ic_logo_landscape.png"

private const val AUTH_OVERSEAS_RESOURCE  = "bannerhub-icon/features_auth_ic_logo_overseas.png"
private const val AUTH_OVERSEAS_DEST      = "$AUTH_DRAWABLE_PREFIX/features_auth_ic_logo_overseas.png"

private const val SPLASH_LOGO_RESOURCE = "bannerhub-icon/splash_logo.png"
private const val SPLASH_LOGO_DEST     =
    "assets/composeResources/com.xiaoji.egggame.features.splash/drawable/splash_logo.png"

private object IconResources

@Suppress("unused")
val changeAppIconPatch = resourcePatch(
    name = "Change app icon",
    description = "Replaces launcher adaptive-icon foreground, full composite " +
        "legacy icons across all density buckets, background vector, in-app Wine " +
        "logo, auth logos, and splash banner. Completely resolves pre-installation " +
        "solid blue icon rendering in Android PackageInstaller.",
) {
    compatibleWith(GAMEHUB_PACKAGE(GAMEHUB_VERSION))

    apply {
        val classLoader = IconResources::class.java.classLoader
            ?: error("classloader unavailable for icon resources")

        fun copy(resource: String, dest: String) {
            classLoader.getResourceAsStream(resource)?.use { input ->
                val destFile = get(dest)
                destFile.parentFile?.mkdirs()
                destFile.outputStream().use { input.copyTo(it) }
            } ?: error("missing $resource in patch bundle resources")
        }

        // 1. Adaptive-Icon Foreground across all density levels
        val foregroundDestinations = listOf(
            "res/drawable-xxxhdpi/ic_launcher_foreground.png",
            "res/drawable-xxhdpi/ic_launcher_foreground.png",
            "res/drawable-xhdpi/ic_launcher_foreground.png",
            "res/drawable-hdpi/ic_launcher_foreground.png",
            "res/drawable-mdpi/ic_launcher_foreground.png",
            "res/drawable/ic_launcher_foreground.png",
            "res/mipmap-xxxhdpi/ic_launcher_foreground.png",
            "res/mipmap-xxhdpi/ic_launcher_foreground.png",
            "res/mipmap-xhdpi/ic_launcher_foreground.png",
            "res/mipmap-hdpi/ic_launcher_foreground.png",
            "res/mipmap-mdpi/ic_launcher_foreground.png"
        )
        for (dest in foregroundDestinations) {
            copy(FOREGROUND_RESOURCE, dest)
        }

        // Delete conflicting legacy vectors
        val vectorsToDelete = listOf(
            "res/drawable/ic_launcher_foreground.xml",
            "res/drawable-v26/ic_launcher_foreground.xml",
            "res/mipmap/ic_launcher_foreground.xml",
            "res/mipmap-v26/ic_launcher_foreground.xml"
        )
        for (vectorPath in vectorsToDelete) {
            val vec = get(vectorPath)
            if (vec.exists()) {
                vec.delete()
            }
        }

        // 2. Full Composite Icon for PackageInstaller / Legacy Launchers
        val compositeDestinations = listOf(
            "res/mipmap-xxxhdpi/ic_launcher.png",
            "res/mipmap-xxhdpi/ic_launcher.png",
            "res/mipmap-xhdpi/ic_launcher.png",
            "res/mipmap-hdpi/ic_launcher.png",
            "res/mipmap-mdpi/ic_launcher.png",
            "res/mipmap-xxxhdpi/ic_launcher_round.png",
            "res/mipmap-xxhdpi/ic_launcher_round.png",
            "res/mipmap-xhdpi/ic_launcher_round.png",
            "res/mipmap-hdpi/ic_launcher_round.png",
            "res/mipmap-mdpi/ic_launcher_round.png",
            "res/drawable-xxxhdpi/ic_launcher.png",
            "res/drawable-xxhdpi/ic_launcher.png",
            "res/drawable-xhdpi/ic_launcher.png",
            "res/drawable-hdpi/ic_launcher.png",
            "res/drawable-mdpi/ic_launcher.png",
            "res/drawable/ic_launcher.png"
        )
        for (dest in compositeDestinations) {
            try {
                copy(COMPOSITE_ICON_RESOURCE, dest)
            } catch (_: Throwable) {
                copy(FOREGROUND_RESOURCE, dest)
            }
        }

        // 3. Clean Neutral Background Vector (prevents solid blue block behind icons)
        val bgXml = """<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#111827"
        android:pathData="M0,0h108v108h-108z" />
</vector>
""".trimIndent()

        val bgFiles = listOf(
            "res/drawable/ic_launcher_background.xml",
            "res/drawable-v26/ic_launcher_background.xml"
        )
        for (bgPath in bgFiles) {
            val bgFile = get(bgPath)
            if (bgFile.exists() || bgPath == "res/drawable/ic_launcher_background.xml") {
                bgFile.parentFile?.mkdirs()
                bgFile.writeText(bgXml)
            }
        }

        // 4. In-App Wine & Branding Logos
        copy(WINE_LOGO_RESOURCE, "res/drawable-xxhdpi/wine_logo.png")
        copy(WINE_LOGO_RESOURCE, "res/drawable/wine_logo.png")
        copy(AUTH_LANDSCAPE_RESOURCE, AUTH_LANDSCAPE_DEST)
        copy(AUTH_OVERSEAS_RESOURCE, AUTH_OVERSEAS_DEST)
        copy(SPLASH_LOGO_RESOURCE, SPLASH_LOGO_DEST)
    }
}

