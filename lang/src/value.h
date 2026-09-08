#pragma once
#include <memory>
#include <string>
#include <vector>

struct Value;
struct SceneElement;

struct Value {
  enum class Kind { Nil, Number, String, Bool } kind = Kind::Nil;
  double number = 0;
  std::string str;
  bool boolean = false;

  static Value makeNil() { return Value(); }
  static Value makeNumber(double v) {
    Value val;
    val.kind = Kind::Number;
    val.number = v;
    return val;
  }
  static Value makeString(const std::string& v) {
    Value val;
    val.kind = Kind::String;
    val.str = v;
    return val;
  }
  static Value makeBool(bool v) {
    Value val;
    val.kind = Kind::Bool;
    val.boolean = v;
    return val;
  }
};
