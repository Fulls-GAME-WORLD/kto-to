#pragma once
#include <string>

enum class TokenType {
  End,
  Ident,
  Number,
  String,
  Package,
  Use,
  Const,
  VarStar,
  Fn,
  Return,
  If,
  Else,
  While,
  True,
  False,
  Print,
  Println,
  Output,
  CallAmp,
  DrawcallAmp,
  Poster,
  Text,
  Box,
  Image,
  Page,
  Plus,
  Minus,
  Star,
  Slash,
  Percent,
  Assign,
  EqEq,
  NotEq,
  Gt,
  Lt,
  GtEq,
  LtEq,
  Not,
  PlusPlus,
  MinusMinus,
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Comma,
  Colon,
  Semicolon,
  Hash,
  Color,
};

struct Token {
  TokenType type = TokenType::End;
  std::string text;
  double number = 0;
  int line = 1;
};
