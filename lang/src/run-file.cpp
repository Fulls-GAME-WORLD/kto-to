#include "run-file.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include "interpreter.h"
#include "lexer.h"
#include "parser.h"

int runFile(const std::string& path) {
  std::ifstream file(path);
  if (!file) {
    std::cerr << "cannot open " << path << std::endl;
    return 1;
  }
  std::stringstream buffer;
  buffer << file.rdbuf();
  Lexer lexer(buffer.str());
  auto tokens = lexer.scan();
  Parser parser(tokens);
  auto program = parser.parse();
  Interpreter interpreter;
  return interpreter.run(*program);
}
