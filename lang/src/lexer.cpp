#include "lexer.h"

Lexer::Lexer(const std::string& source) : src(source) {}

static bool isAlpha(char c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_' || c == '&';
}

static bool isDigit(char c) { return c >= '0' && c <= '9'; }

static bool isHex(char c) {
  return isDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

std::vector<Token> Lexer::scan() {
  std::vector<Token> tokens;
  auto peek = [&]() -> char { return pos < src.size() ? src[pos] : '\0'; };
  auto advance = [&]() -> char { return pos < src.size() ? src[pos++] : '\0'; };
  while (pos < src.size()) {
    char c = peek();
    if (c == ' ' || c == '\t' || c == '\r') {
      advance();
      continue;
    }
    if (c == '\n') {
      advance();
      line++;
      continue;
    }
    if (c == '/' && pos + 1 < src.size() && src[pos + 1] == '/') {
      while (pos < src.size() && src[pos] != '\n') pos++;
      continue;
    }
    Token token;
    token.line = line;
    if (c == '#') {
      if (pos + 1 < src.size() && src[pos + 1] == 'u' && pos + 2 < src.size() &&
          src[pos + 2] == 's' && pos + 3 < src.size() && src[pos + 3] == 'e') {
        pos += 4;
        token.type = TokenType::Use;
        token.text = "#use";
        tokens.push_back(token);
        continue;
      }
      advance();
      std::string hex;
      while (pos < src.size() && isHex(src[pos]) && hex.size() < 8) hex += src[pos++];
      token.type = TokenType::Color;
      token.text = "#" + hex;
      tokens.push_back(token);
      continue;
    }
    if (c == '"') {
      advance();
      std::string value;
      while (pos < src.size() && src[pos] != '"') {
        if (src[pos] == '\\' && pos + 1 < src.size()) {
          char e = src[pos + 1];
          if (e == 'n') value += '\n';
          else if (e == 't') value += '\t';
          else if (e == 'r') value += '\r';
          else if (e == '"') value += '"';
          else if (e == '\\') value += '\\';
          else value += e;
          pos += 2;
        } else {
          if (src[pos] == '\n') line++;
          value += src[pos++];
        }
      }
      if (pos < src.size()) pos++;
      token.type = TokenType::String;
      token.text = value;
      tokens.push_back(token);
      continue;
    }
    if (isDigit(c) || (c == '.' && pos + 1 < src.size() && isDigit(src[pos + 1]))) {
      size_t start = pos;
      while (pos < src.size() && (isDigit(src[pos]) || src[pos] == '.')) pos++;
      token.type = TokenType::Number;
      token.text = src.substr(start, pos - start);
      token.number = std::stod(token.text);
      tokens.push_back(token);
      continue;
    }
    if (isAlpha(c)) {
      size_t start = pos;
      while (pos < src.size() && (isAlpha(src[pos]) || isDigit(src[pos]) || src[pos] == '_'))
        pos++;
      while (pos < src.size() && src[pos] == '-' && pos + 1 < src.size() &&
             (isAlpha(src[pos + 1]) || src[pos + 1] == '_')) {
        pos++;
        while (pos < src.size() && (isAlpha(src[pos]) || isDigit(src[pos]) || src[pos] == '_'))
          pos++;
      }
      if (pos < src.size() && (src[pos] == '*' || src[pos] == '&')) pos++;
      std::string word = src.substr(start, pos - start);
      token.text = word;
      token.type = TokenType::Ident;
      if (word == "package") token.type = TokenType::Package;
      else if (word == "const") token.type = TokenType::Const;
      else if (word == "var*") token.type = TokenType::VarStar;
      else if (word == "fn") token.type = TokenType::Fn;
      else if (word == "return") token.type = TokenType::Return;
      else if (word == "if") token.type = TokenType::If;
      else if (word == "else") token.type = TokenType::Else;
      else if (word == "while") token.type = TokenType::While;
      else if (word == "true" || word == "false") {
        token.type = word == "true" ? TokenType::True : TokenType::False;
      } else if (word == "print") token.type = TokenType::Print;
      else if (word == "println") token.type = TokenType::Println;
      else if (word == "output") token.type = TokenType::Output;
      else if (word == "call&") token.type = TokenType::CallAmp;
      else if (word == "drawcall&") token.type = TokenType::DrawcallAmp;
      else if (word == "poster") token.type = TokenType::Poster;
      else if (word == "text") token.type = TokenType::Text;
      else if (word == "box") token.type = TokenType::Box;
      else if (word == "image") token.type = TokenType::Image;
      else if (word == "page") token.type = TokenType::Page;
      tokens.push_back(token);
      continue;
    }
    advance();
    switch (c) {
      case '+':
        if (peek() == '+') {
          advance();
          token.type = TokenType::PlusPlus;
        } else token.type = TokenType::Plus;
        break;
      case '-':
        if (peek() == '-') {
          advance();
          token.type = TokenType::MinusMinus;
        } else token.type = TokenType::Minus;
        break;
      case '*': token.type = TokenType::Star; break;
      case '/': token.type = TokenType::Slash; break;
      case '%': token.type = TokenType::Percent; break;
      case '(': token.type = TokenType::LParen; break;
      case ')': token.type = TokenType::RParen; break;
      case '{': token.type = TokenType::LBrace; break;
      case '}': token.type = TokenType::RBrace; break;
      case '[': token.type = TokenType::LBracket; break;
      case ']': token.type = TokenType::RBracket; break;
      case ',': token.type = TokenType::Comma; break;
      case ':': token.type = TokenType::Colon; break;
      case ';': token.type = TokenType::Semicolon; break;
      case '=':
        if (peek() == '=') {
          advance();
          token.type = TokenType::EqEq;
        } else token.type = TokenType::Assign;
        break;
      case '!':
        if (peek() == '=') {
          advance();
          token.type = TokenType::NotEq;
        } else token.type = TokenType::Not;
        break;
      case '>':
        if (peek() == '=') {
          advance();
          token.type = TokenType::GtEq;
        } else token.type = TokenType::Gt;
        break;
      case '<':
        if (peek() == '=') {
          advance();
          token.type = TokenType::LtEq;
        } else token.type = TokenType::Lt;
        break;
      default: continue;
    }
    token.text = std::string(1, c);
    tokens.push_back(token);
  }
  Token end;
  end.type = TokenType::End;
  end.line = line;
  tokens.push_back(end);
  return tokens;
}
