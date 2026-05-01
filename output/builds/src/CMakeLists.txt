# SentinelForge CUDA/C++ Build
# Requires: CUDA Toolkit >= 11.8, CMake >= 3.18
#
# Build:
#   mkdir build && cd build
#   cmake .. -DCMAKE_CUDA_ARCHITECTURES=87  # sm_87 = Jetson Orin
#   make -j$(nproc)

cmake_minimum_required(VERSION 3.18)
project(sentinelforge_edge LANGUAGES CXX CUDA)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CUDA_STANDARD 17)

# Default to Jetson AGX Orin (sm_87), override with -DCMAKE_CUDA_ARCHITECTURES=XX
if(NOT DEFINED CMAKE_CUDA_ARCHITECTURES)
    set(CMAKE_CUDA_ARCHITECTURES 87)
endif()

# Optimization flags
set(CMAKE_CUDA_FLAGS "${CMAKE_CUDA_FLAGS} -O3 --use_fast_math")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")

# --- CUDA kernels ---
add_library(calibration STATIC cuda/calibration.cu)
target_include_directories(calibration PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_library(streak_detect STATIC cuda/streak_detect.cu)
target_include_directories(streak_detect PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# --- C++ modules ---
add_library(plate_solver STATIC cpp/plate_solver.cpp)
target_include_directories(plate_solver PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_library(photometry STATIC cpp/photometry.cpp)
target_include_directories(photometry PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# --- Combined edge pipeline library ---
add_library(sentinelforge_edge STATIC)
target_link_libraries(sentinelforge_edge
    calibration
    streak_detect
    plate_solver
    photometry
)

# --- Test executables ---
add_executable(test_calibration cuda/calibration.cu)
target_compile_definitions(test_calibration PRIVATE STANDALONE_TEST)

add_executable(test_streak cuda/streak_detect.cu)
target_compile_definitions(test_streak PRIVATE STANDALONE_TEST)

# --- Install ---
install(TARGETS sentinelforge_edge DESTINATION lib)
install(FILES
    cuda/calibration.cu
    cuda/streak_detect.cu
    cpp/plate_solver.cpp
    cpp/photometry.cpp
    DESTINATION src)
