cmake_minimum_required(VERSION 3.16)
project(kak-lang VERSION 0.1.0 LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_executable(kak
  src/main.cpp
  src/run-file.cpp
  src/lexer.cpp
  src/parser.cpp
  src/interpreter.cpp
  src/json-escape.cpp
)
target_include_directories(kak PRIVATE src)
