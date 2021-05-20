cmake_minimum_required( VERSION 3.1 )
project( HelloCV )

# Use C++ 11 by default
set( CMAKE_CXX_STANDARD 11 )

# Set Release as default build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif(NOT CMAKE_BUILD_TYPE)

# Does not work
# find_package( OpenCV REQUIRED PATHS /usr/local/Cellar/opencv/4.5.0_5/include/opencv4/opencv2/ NO_DEFAULT_PATH)
SET(OpenCV_DIR /Users/jrundquist/src/installation/OpenCV-master/include/opencv4 )

# Needed for opencv2/
include_directories( "${OpenCV_DIR}" )

#Emscipten
include_directories( "/Users/jrundquist/src/emscripten/system/include" )

# Our hello world executable
add_executable( hello src/hello.cpp )

# Specify linker arguments
# set_target_properties( hello PROPERTIES LINK_FLAGS "-s DEMANGLE_SUPPORT=1 --preload-file assets --bind" )
# set_target_properties( hello PROPERTIES LINK_FLAGS "-s DEMANGLE_SUPPORT=1 --bind" )