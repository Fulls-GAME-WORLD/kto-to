#include "parser.h"
#include <functional>
#include <stdexcept>

Parser::Parser(const std::vector<Token>& t) : tokens(t) {}

static Token peekTok(const std::vector<Token>& tokens, size_t pos) { return tokens[pos]; }

std::unique_ptr<Program> Parser::parse() {
  auto program = std::make_unique<Program>();
  auto at = [&]() -> const Token& { return tokens[pos]; };
  auto next = [&]() -> const Token& { return tokens[pos++]; };
  auto expect = [&](TokenType type, const std::string& msg) -> Token {
    if (at().type != type) throw std::runtime_error(msg + " at line " + std::to_string(at().line));
    return next();
  };

  std::function<std::unique_ptr<Expr>()> parseExpr;
  std::function<std::unique_ptr<Expr>()> parseEquality;
  std::function<std::unique_ptr<Expr>()> parseComparison;
  std::function<std::unique_ptr<Expr>()> parseTerm;
  std::function<std::unique_ptr<Expr>()> parseFactor;
  std::function<std::unique_ptr<Expr>()> parseUnary;
  std::function<std::unique_ptr<Expr>()> parsePrimary;
  std::function<std::unique_ptr<BlockStmt>()> parseBlock;
  std::function<std::unique_ptr<Stmt>()> parseStmt;
  std::function<std::unique_ptr<PosterItemStmt>()> parsePosterItem;

  parsePrimary = [&]() -> std::unique_ptr<Expr> {
    const Token& tok = at();
    if (tok.type == TokenType::Number) {
      next();
      return std::make_unique<LiteralExpr>(Value::makeNumber(tok.number));
    }
    if (tok.type == TokenType::String || tok.type == TokenType::Color) {
      next();
      return std::make_unique<LiteralExpr>(Value::makeString(tok.text));
    }
    if (tok.type == TokenType::True) {
      next();
      return std::make_unique<LiteralExpr>(Value::makeBool(true));
    }
    if (tok.type == TokenType::False) {
      next();
      return std::make_unique<LiteralExpr>(Value::makeBool(false));
    }
    if (tok.type == TokenType::CallAmp) {
      next();
      expect(TokenType::Assign, "expected = after call&");
      expect(TokenType::LParen, "expected ( after call& =");
      auto node = std::make_unique<CallAmpExpr>();
      if (at().type != TokenType::RParen) {
        node->target = parseExpr();
        while (at().type == TokenType::Comma) {
          next();
          node->args.push_back(parseExpr());
        }
      }
      expect(TokenType::RParen, "expected )");
      return node;
    }
    if (tok.type == TokenType::DrawcallAmp) {
      next();
      expect(TokenType::Assign, "expected = after drawcall&");
      expect(TokenType::LParen, "expected ( after drawcall& =");
      Token name = expect(TokenType::String, "expected string in drawcall&");
      expect(TokenType::RParen, "expected )");
      auto node = std::make_unique<DrawcallExpr>();
      node->name = name.text;
      return node;
    }
    if (tok.type == TokenType::LParen) {
      next();
      auto inner = parseExpr();
      expect(TokenType::RParen, "expected )");
      return inner;
    }
    if (tok.type == TokenType::Ident) {
      std::string name = tok.text;
      next();
      if (at().type == TokenType::LParen) {
        next();
        auto node = std::make_unique<FnCallExpr>();
        node->name = name;
        if (at().type != TokenType::RParen) {
          node->args.push_back(parseExpr());
          while (at().type == TokenType::Comma) {
            next();
            node->args.push_back(parseExpr());
          }
        }
        expect(TokenType::RParen, "expected )");
        return node;
      }
      return std::make_unique<VarExpr>(name);
    }
    throw std::runtime_error("unexpected token at line " + std::to_string(tok.line));
  };

  parseUnary = [&]() -> std::unique_ptr<Expr> {
    if (at().type == TokenType::Minus || at().type == TokenType::Not) {
      std::string op = at().type == TokenType::Minus ? "-" : "!";
      next();
      return std::make_unique<UnaryExpr>(op, parseUnary());
    }
    return parsePrimary();
  };

  parseFactor = [&]() -> std::unique_ptr<Expr> {
    auto left = parseUnary();
    while (at().type == TokenType::Star || at().type == TokenType::Slash ||
           at().type == TokenType::Percent) {
      std::string op = at().type == TokenType::Star ? "*" : at().type == TokenType::Slash ? "/" : "%";
      next();
      left = std::make_unique<BinaryExpr>(op, std::move(left), parseUnary());
    }
    return left;
  };

  parseTerm = [&]() -> std::unique_ptr<Expr> {
    auto left = parseFactor();
    while (at().type == TokenType::Plus || at().type == TokenType::Minus) {
      std::string op = at().type == TokenType::Plus ? "+" : "-";
      next();
      left = std::make_unique<BinaryExpr>(op, std::move(left), parseFactor());
    }
    return left;
  };

  parseComparison = [&]() -> std::unique_ptr<Expr> {
    auto left = parseTerm();
    while (at().type == TokenType::Gt || at().type == TokenType::Lt ||
           at().type == TokenType::GtEq || at().type == TokenType::LtEq) {
      std::string op = ">";
      if (at().type == TokenType::Lt) op = "<";
      else if (at().type == TokenType::GtEq) op = ">=";
      else if (at().type == TokenType::LtEq) op = "<=";
      next();
      left = std::make_unique<BinaryExpr>(op, std::move(left), parseTerm());
    }
    return left;
  };

  parseEquality = [&]() -> std::unique_ptr<Expr> {
    auto left = parseComparison();
    while (at().type == TokenType::EqEq || at().type == TokenType::NotEq) {
      std::string op = at().type == TokenType::EqEq ? "==" : "!=";
      next();
      left = std::make_unique<BinaryExpr>(op, std::move(left), parseComparison());
    }
    return left;
  };

  parseExpr = [&]() -> std::unique_ptr<Expr> { return parseEquality(); };

  parseBlock = [&]() -> std::unique_ptr<BlockStmt> {
    expect(TokenType::LBrace, "expected {");
    auto block = std::make_unique<BlockStmt>();
    while (at().type != TokenType::RBrace && at().type != TokenType::End) {
      block->items.push_back(parseStmt());
    }
    expect(TokenType::RBrace, "expected }");
    return block;
  };

  auto parsePropValue = [&](std::unique_ptr<Expr> base) -> std::unique_ptr<Expr> {
    if (at().type == TokenType::Ident) {
      std::string unit = at().text;
      bool isUnit = unit == "px" || unit == "pt" || unit == "%" || unit == "em" ||
                    unit == "rem" || unit == "vh" || unit == "vw" || unit == "deg";
      if (isUnit) {
        next();
        LiteralExpr* lit = dynamic_cast<LiteralExpr*>(base.get());
        if (lit && lit->value.kind == Value::Kind::Number) {
          long long whole = static_cast<long long>(lit->value.number);
          std::string num =
              lit->value.number == static_cast<double>(whole)
                  ? std::to_string(whole)
                  : std::to_string(lit->value.number);
          return std::make_unique<LiteralExpr>(Value::makeString(num + unit));
        }
      }
    }
    return base;
  };

  parsePosterItem = [&]() -> std::unique_ptr<PosterItemStmt> {
    auto item = std::make_unique<PosterItemStmt>();
    if (at().type == TokenType::Text) {
      next();
      item->kind = "text";
      if (at().type == TokenType::String) item->text = next().text;
    } else if (at().type == TokenType::Box) {
      next();
      item->kind = "box";
    } else if (at().type == TokenType::Image) {
      next();
      item->kind = "image";
      if (at().type == TokenType::String) item->text = next().text;
    } else if (at().type == TokenType::Page) {
      next();
      item->kind = "page";
    } else if (at().type == TokenType::Ident) {
      std::string key = next().text;
      expect(TokenType::Colon, "expected : in style");
      auto val = parseExpr();
      val = parsePropValue(std::move(val));
      if (at().type == TokenType::Semicolon) next();
      PropAssign prop;
      prop.key = key;
      prop.value = std::move(val);
      item->kind = "style";
      item->props.push_back(std::move(prop));
      return item;
    } else {
      throw std::runtime_error("unexpected poster item at line " + std::to_string(at().line));
    }
    if (at().type == TokenType::LBrace) {
      next();
      while (at().type != TokenType::RBrace && at().type != TokenType::End) {
        if (at().type == TokenType::Text || at().type == TokenType::Box ||
            at().type == TokenType::Image || at().type == TokenType::Page) {
          item->children.push_back(parsePosterItem());
        } else if (at().type == TokenType::Ident) {
          std::string key = next().text;
          expect(TokenType::Colon, "expected : in style");
          auto val = parseExpr();
          val = parsePropValue(std::move(val));
          if (at().type == TokenType::Semicolon) next();
          PropAssign prop;
          prop.key = key;
          prop.value = std::move(val);
          item->props.push_back(std::move(prop));
        } else {
          throw std::runtime_error("unexpected token in block at line " +
                                   std::to_string(at().line));
        }
      }
      expect(TokenType::RBrace, "expected }");
    }
    if (at().type == TokenType::Semicolon) next();
    return item;
  };

  parseStmt = [&]() -> std::unique_ptr<Stmt> {
    if (at().type == TokenType::VarStar) {
      next();
      Token name = expect(TokenType::Ident, "expected name after var*");
      auto decl = std::make_unique<VarDeclStmt>();
      decl->name = name.text;
      if (at().type == TokenType::Plus) {
        next();
        expect(TokenType::LBrace, "expected {type}");
        Token hint = expect(TokenType::Ident, "expected type");
        decl->typeHint = hint.text;
        expect(TokenType::RBrace, "expected }");
      }
      expect(TokenType::Assign, "expected =");
      decl->init = parseExpr();
      return decl;
    }
    if (at().type == TokenType::Const) {
      next();
      Token name = expect(TokenType::Ident, "expected name after const");
      auto decl = std::make_unique<VarDeclStmt>();
      decl->name = name.text;
      decl->isConst = true;
      expect(TokenType::Assign, "expected =");
      decl->init = parseExpr();
      return decl;
    }
    if (at().type == TokenType::Fn) {
      next();
      Token name = expect(TokenType::Ident, "expected fn name");
      auto decl = std::make_unique<FnDeclStmt>();
      decl->name = name.text;
      expect(TokenType::LParen, "expected (");
      if (at().type != TokenType::RParen) {
        decl->params.push_back(expect(TokenType::Ident, "expected param").text);
        while (at().type == TokenType::Comma) {
          next();
          decl->params.push_back(expect(TokenType::Ident, "expected param").text);
        }
      }
      expect(TokenType::RParen, "expected )");
      decl->body = parseBlock();
      return decl;
    }
    if (at().type == TokenType::Return) {
      next();
      auto ret = std::make_unique<ReturnStmt>();
      if (at().type != TokenType::RBrace && at().type != TokenType::End) {
        try {
          ret->value = parseExpr();
        } catch (...) {
          ret->value = nullptr;
        }
      }
      return ret;
    }
    if (at().type == TokenType::If) {
      next();
      auto node = std::make_unique<IfStmt>();
      node->cond = parseExpr();
      node->thenBranch = parseBlock();
      if (at().type == TokenType::Else) {
        next();
        node->elseBranch = parseBlock();
      }
      return node;
    }
    if (at().type == TokenType::While) {
      next();
      auto node = std::make_unique<WhileStmt>();
      node->cond = parseExpr();
      node->body = parseBlock();
      return node;
    }
    if (at().type == TokenType::Poster) {
      next();
      auto node = std::make_unique<PosterStmt>();
      if (at().type == TokenType::String) node->name = next().text;
      if (at().type == TokenType::Number) {
        double w = next().number;
        node->width = std::make_unique<LiteralExpr>(Value::makeNumber(w));
        if (at().type == TokenType::Ident && at().text == "x") {
          next();
          if (at().type == TokenType::Number) {
            double h = next().number;
            node->height = std::make_unique<LiteralExpr>(Value::makeNumber(h));
          }
        } else if (at().type == TokenType::Number) {
          double h = next().number;
          node->height = std::make_unique<LiteralExpr>(Value::makeNumber(h));
        }
      }
      expect(TokenType::LBrace, "expected { for poster");
      while (at().type != TokenType::RBrace && at().type != TokenType::End) {
        if (at().type == TokenType::Text || at().type == TokenType::Box ||
            at().type == TokenType::Image || at().type == TokenType::Page) {
          node->items.push_back(parsePosterItem());
        } else if (at().type == TokenType::Ident) {
          std::string key = next().text;
          expect(TokenType::Colon, "expected : in poster");
          auto val = parseExpr();
          val = parsePropValue(std::move(val));
          if (at().type == TokenType::Semicolon) next();
          PropAssign prop;
          prop.key = key;
          prop.value = std::move(val);
          node->props.push_back(std::move(prop));
        } else {
          throw std::runtime_error("unexpected token in poster at line " +
                                   std::to_string(at().line));
        }
      }
      expect(TokenType::RBrace, "expected }");
      return node;
    }
    if (at().type == TokenType::Print || at().type == TokenType::Println ||
        at().type == TokenType::Output) {
      auto node = std::make_unique<PrintStmt>();
      node->mode = at().type == TokenType::Print
                       ? "print"
                       : at().type == TokenType::Println ? "println" : "output";
      next();
      expect(TokenType::LParen, "expected (");
      if (at().type != TokenType::RParen) {
        node->args.push_back(parseExpr());
        while (at().type == TokenType::Comma) {
          next();
          node->args.push_back(parseExpr());
        }
      }
      expect(TokenType::RParen, "expected )");
      return node;
    }
    if (at().type == TokenType::Ident) {
      std::string name = at().text;
      if (pos + 1 < tokens.size() &&
          (tokens[pos + 1].type == TokenType::PlusPlus ||
           tokens[pos + 1].type == TokenType::MinusMinus)) {
        next();
        bool inc = at().type == TokenType::PlusPlus;
        next();
        auto node = std::make_unique<IncDecStmt>();
        node->name = name;
        node->isInc = inc;
        return node;
      }
    }
    auto expr = parseExpr();
    auto stmt = std::make_unique<ExprStmt>();
    stmt->expr = std::move(expr);
    return stmt;
  };

  (void)peekTok;
  while (at().type != TokenType::End) {
    if (at().type == TokenType::Package) {
      next();
      program->packageName = expect(TokenType::Ident, "expected package name").text;
      continue;
    }
    if (at().type == TokenType::Use) {
      next();
      program->uses.push_back(expect(TokenType::String, "expected path after #use").text);
      continue;
    }
    if (at().type == TokenType::Return) {
      auto ret = std::make_unique<ReturnStmt>();
      next();
      try {
        if (at().type != TokenType::End) ret->value = parseExpr();
      } catch (...) {
      }
      program->top.push_back(std::move(ret));
      continue;
    }
    program->top.push_back(parseStmt());
  }
  return program;
}
