cmake_minimum_required(VERSION 3.10)
project(llamajni)

# Path to llama.cpp source or prebuilt static library root.
# Option A: If you have llama.cpp in ../llama.cpp, add it as a subdirectory:
# add_subdirectory(${CMAKE_SOURCE_DIR}/../llama.cpp llama_cpp_build)
# Then link target llama (or whatever target name llama.cpp defines).

# Option B: If you built libllama.a for Android and placed it under
# ${CMAKE_SOURCE_DIR}/libs/${ANDROID_ABI}/libllama.a, link to it directly.

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_library(llamajni SHARED
    llamajni.cpp
    llama_api_stub.h
)

# If you compiled llama.cpp and have a static lib path:
# target_link_libraries(llamajni PUBLIC ${CMAKE_SOURCE_DIR}/libs/${ANDROID_ABI}/libllama.a)

# Add pthread for threading
find_library(log-lib log)
target_link_libraries(llamajni PUBLIC ${log-lib} android) # add libllama.a or llama target when available

# Example: if llama target exists (after add_subdirectory)
# target_link_libraries(llamajni PUBLIC llama)