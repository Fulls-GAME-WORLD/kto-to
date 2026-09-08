#pragma once
#include <string>
#include <vector>
#include "token.h"

class Lexer {
 public:
  explicit Lexer(const std::string& source);
  std::vector<Token> scan();

 private:
  std::string src;
  size_t pos = 0;
  int line = 1;
};
