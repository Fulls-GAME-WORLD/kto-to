#pragma once
#include <memory>
#include <string>
#include <vector>
#include "token.h"
#include "value.h"

struct Expr {
  virtual ~Expr() = default;
};

struct Stmt {
  virtual ~Stmt() = default;
};

struct LiteralExpr : Expr {
  Value value;
  explicit LiteralExpr(Value v) : value(v) {}
};

struct VarExpr : Expr {
  std::string name;
  explicit VarExpr(const std::string& n) : name(n) {}
};

struct BinaryExpr : Expr {
  std::string op;
  std::unique_ptr<Expr> left;
  std::unique_ptr<Expr> right;
  BinaryExpr(std::string o, std::unique_ptr<Expr> l, std::unique_ptr<Expr> r)
      : op(o), left(std::move(l)), right(std::move(r)) {}
};

struct UnaryExpr : Expr {
  std::string op;
  std::unique_ptr<Expr> inner;
  UnaryExpr(std::string o, std::unique_ptr<Expr> e) : op(o), inner(std::move(e)) {}
};

struct FnCallExpr : Expr {
  std::string name;
  std::vector<std::unique_ptr<Expr>> args;
};

struct CallAmpExpr : Expr {
  std::unique_ptr<Expr> target;
  std::vector<std::unique_ptr<Expr>> args;
};

struct DrawcallExpr : Expr {
  std::string name;
};

struct BlockStmt : Stmt {
  std::vector<std::unique_ptr<Stmt>> items;
};

struct VarDeclStmt : Stmt {
  std::string name;
  std::string typeHint;
  std::unique_ptr<Expr> init;
  bool isConst = false;
};

struct FnDeclStmt : Stmt {
  std::string name;
  std::vector<std::string> params;
  std::unique_ptr<BlockStmt> body;
};

struct ReturnStmt : Stmt {
  std::unique_ptr<Expr> value;
};

struct IfStmt : Stmt {
  std::unique_ptr<Expr> cond;
  std::unique_ptr<BlockStmt> thenBranch;
  std::unique_ptr<BlockStmt> elseBranch;
};

struct WhileStmt : Stmt {
  std::unique_ptr<Expr> cond;
  std::unique_ptr<BlockStmt> body;
};

struct IncDecStmt : Stmt {
  std::string name;
  bool isInc = true;
};

struct PrintStmt : Stmt {
  std::string mode;
  std::vector<std::unique_ptr<Expr>> args;
};

struct ExprStmt : Stmt {
  std::unique_ptr<Expr> expr;
};

struct PropAssign {
  std::string key;
  std::unique_ptr<Expr> value;
};

struct PosterItemStmt : Stmt {
  std::string kind;
  std::string text;
  std::vector<PropAssign> props;
  std::vector<std::unique_ptr<PosterItemStmt>> children;
};

struct PosterStmt : Stmt {
  std::string name;
  std::unique_ptr<Expr> width;
  std::unique_ptr<Expr> height;
  std::vector<std::unique_ptr<PosterItemStmt>> items;
  std::vector<PropAssign> props;
};

struct Program {
  std::string packageName;
  std::vector<std::string> uses;
  std::vector<std::unique_ptr<Stmt>> top;
};

class Parser {
 public:
  explicit Parser(const std::vector<Token>& tokens);
  std::unique_ptr<Program> parse();

 private:
  const std::vector<Token>& tokens;
  size_t pos = 0;
};
