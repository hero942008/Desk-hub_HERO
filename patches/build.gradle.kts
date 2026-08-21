group = "com.github.herohuboptimized"

patches {
    about {
        name = "HeroHub Optimized"
        description = "HeroHub Optimized patches for GameHub with high-performance Rust Vulkan 1.3 core, zero-copy rendering, and low latency input."
        source = "https://github.com/herohuboptimized/herohub-optimized"
        author = "HeroHub"
        contact = "https://github.com/herohuboptimized"
        website = "https://github.com/herohuboptimized/herohub-optimized"
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
