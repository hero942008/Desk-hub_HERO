group = "com.github.deskhubemulator"

patches {
    about {
        name = "DeskHub emulator"
        description = "DeskHub emulator patches with high-performance Rust Vulkan 1.3 core, zero-copy rendering, and low latency input."
        source = "https://github.com/hero942008/Banerhubhero"
        author = "DeskHub"
        contact = "https://github.com/hero942008/Banerhubhero"
        website = "https://github.com/hero942008/Banerhubhero"
        license = "GNU General Public License v3.0"
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xexplicit-backing-fields",
            "-Xcontext-parameters",
        )
    }
}

afterEvaluate {
    val extConfig = configurations.findByName("extensionConfiguration") ?: return@afterEvaluate

    sourceSets.named("main") {
        resources.setSrcDirs(listOf("src/main/resources"))
    }

    tasks.named<Copy>("processResources") {
        from(extConfig)
    }
}
