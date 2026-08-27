package app.revanced.patches.all.misc.appname

import app.revanced.patcher.patch.resourcePatch
import app.revanced.patcher.patch.stringOption
import app.revanced.util.getNode
import org.w3c.dom.Element

val changeAppNamePatch = resourcePatch(
    name = "Change app name",
    description = "Changes the display name of the app in the launcher.",
    use = true,
) {
    val appName by stringOption(
        name = "appName",
        default = "DeskHub ALPHA test v6 1.3.0",
        description = "The name to display in the launcher.",
        required = false,
    )

    afterDependents {
        document("AndroidManifest.xml").use { document ->
            val applicationNode = document.getNode("application") as Element
            applicationNode.setAttribute("android:label", appName ?: "DeskHub ALPHA test v6 1.3.0")
        }
    }
}
