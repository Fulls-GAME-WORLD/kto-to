#pragma once
#include <map>
#include <memory>
#include <string>
#include <vector>
#include "parser.h"
#include "value.h"

struct SceneNode {
  std::string kind;
  std::string text;
  std::map<std::string, std::string> props;
  std::vector<SceneNode> children;
};

struct ScenePoster {
  std::string name = "poster";
  double width = 794;
  double height = 1123;
  std::map<std::string, std::string> props;
  std::vector<SceneNode> elements;
};

class Interpreter {
 public:
  int run(Program& program);

 private:
  std::vector<std::map<std::string, Value>> scopes;
  std::map<std::string, Value> consts;
  std::map<std::string, FnDeclStmt*> functions;
  std::vector<ScenePoster> posters;
  int exitCode = 0;
};
