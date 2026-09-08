#include <iostream>
#include "run-file.h"

int main(int argc, char** argv) {
  if (argc < 2) {
    std::cout << "usage: kak <file.kak>" << std::endl;
    return 1;
  }
  try {
    return runFile(argv[1]);
  } catch (const std::exception& e) {
    std::cerr << "error: " << e.what() << std::endl;
    return 1;
  }
}
