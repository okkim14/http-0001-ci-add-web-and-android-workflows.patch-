android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags "-std=c++17 -O3 -fexceptions"
            }
        }
        ndk {
            abiFilters.addAll(listOf("arm64-v8a")) // chosen ABI
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.10.2"
        }
    }

    // packaging options: include libs if you put libllama.a or other files
}