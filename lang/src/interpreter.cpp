#include "interpreter.h"
#include <cmath>
#include <functional>
#include <iostream>
#include <stdexcept>
#include "json-escape.h"

namespace {
struct ReturnSignal {
  Value value;
  bool hasValue = false;
};

std::string valueToString(const Value& v) {
  switch (v.kind) {
    case Value::Kind::Nil: return "nil";
    case Value::Kind::Bool: return v.boolean ? "true" : "false";
    case Value::Kind::String: return v.str;
    case Value::Kind::Number: {
      long long whole = static_cast<long long>(v.number);
      if (v.number == static_cast<double>(whole)) return std::to_string(whole);
      std::string s = std::to_string(v.number);
      while (s.size() > 1 && s.back() == '0') s.pop_back();
      if (!s.empty() && s.back() == '.') s.pop_back();
      return s;
    }
  }
  return "nil";
}

bool isTruthy(const Value& v) {
  switch (v.kind) {
    case Value::Kind::Nil: return false;
    case Value::Kind::Bool: return v.boolean;
    case Value::Kind::Number: return v.number != 0;
    case Value::Kind::String: return !v.str.empty();
  }
  return false;
}

double toNumber(const Value& v) {
  if (v.kind == Value::Kind::Number) return v.number;
  if (v.kind == Value::Kind::Bool) return v.boolean ? 1 : 0;
  if (v.kind == Value::Kind::String) {
    try {
      return std::stod(v.str);
    } catch (...) {
      return 0;
    }
  }
  return 0;
}
}  // namespace

int Interpreter::run(Program& program) {
  scopes.emplace_back();
  auto defineGlobal = [&](const std::string& name, Value v, bool isConst) {
    if (isConst) consts[name] = v;
    scopes.back()[name] = v;
  };
  auto lookup = [&](const std::string& name) -> Value {
    for (int i = static_cast<int>(scopes.size()) - 1; i >= 0; --i) {
      auto it = scopes[i].find(name);
      if (it != scopes[i].end()) return it->second;
    }
    auto it = consts.find(name);
    if (it != consts.end()) return it->second;
    throw std::runtime_error("unknown name: " + name);
  };
  auto assign = [&](const std::string& name, Value v) {
    if (consts.count(name)) throw std::runtime_error("cannot assign to const: " + name);
    for (int i = static_cast<int>(scopes.size()) - 1; i >= 0; --i) {
      auto it = scopes[i].find(name);
      if (it != scopes[i].end()) {
        it->second = v;
        return;
      }
    }
    scopes.back()[name] = v;
  };

  std::function<Value(Expr*)> eval;
  std::function<void(Stmt*, ReturnSignal&)> exec;
  std::function<void(BlockStmt*, ReturnSignal&)> execBlock;
  std::function<Value(FnDeclStmt*, const std::vector<Value>&)> callFn;

  eval = [&](Expr* e) -> Value {
    if (auto* lit = dynamic_cast<LiteralExpr*>(e)) return lit->value;
    if (auto* v = dynamic_cast<VarExpr*>(e)) return lookup(v->name);
    if (auto* u = dynamic_cast<UnaryExpr*>(e)) {
      Value inner = eval(u->inner.get());
      if (u->op == "-") return Value::makeNumber(-toNumber(inner));
      return Value::makeBool(!isTruthy(inner));
    }
    if (auto* b = dynamic_cast<BinaryExpr*>(e)) {
      Value l = eval(b->left.get());
      Value r = eval(b->right.get());
      if (b->op == "+") {
        if (l.kind == Value::Kind::String || r.kind == Value::Kind::String)
          return Value::makeString(valueToString(l) + valueToString(r));
        return Value::makeNumber(toNumber(l) + toNumber(r));
      }
      if (b->op == "-") return Value::makeNumber(toNumber(l) - toNumber(r));
      if (b->op == "*") return Value::makeNumber(toNumber(l) * toNumber(r));
      if (b->op == "/") {
        double d = toNumber(r);
        if (d == 0) throw std::runtime_error("division by zero");
        return Value::makeNumber(toNumber(l) / d);
      }
      if (b->op == "%") {
        double d = toNumber(r);
        if (d == 0) throw std::runtime_error("division by zero");
        return Value::makeNumber(std::fmod(toNumber(l), d));
      }
      if (b->op == "==") {
        bool eq = valueToString(l) == valueToString(r) && l.kind == r.kind;
        if (l.kind == Value::Kind::Number && r.kind == Value::Kind::Number)
          eq = toNumber(l) == toNumber(r);
        return Value::makeBool(eq);
      }
      if (b->op == "!=") {
        bool eq = valueToString(l) == valueToString(r) && l.kind == r.kind;
        if (l.kind == Value::Kind::Number && r.kind == Value::Kind::Number)
          eq = toNumber(l) == toNumber(r);
        return Value::makeBool(!eq);
      }
      double diff = toNumber(l) - toNumber(r);
      if (b->op == ">") return Value::makeBool(diff > 0);
      if (b->op == "<") return Value::makeBool(diff < 0);
      if (b->op == ">=") return Value::makeBool(diff >= 0);
      return Value::makeBool(diff <= 0);
    }
    if (auto* c = dynamic_cast<FnCallExpr*>(e)) {
      auto it = functions.find(c->name);
      if (it == functions.end()) {
        if (c->name == "PrintResult" && !c->args.empty()) {
          std::cout << valueToString(eval(c->args[0].get())) << std::endl;
          return Value::makeNil();
        }
        throw std::runtime_error("unknown function: " + c->name);
      }
      std::vector<Value> args;
      for (auto& a : c->args) args.push_back(eval(a.get()));
      return callFn(it->second, args);
    }
    if (auto* c = dynamic_cast<CallAmpExpr*>(e)) {
      Value target = eval(c->target.get());
      std::string name = valueToString(target);
      auto it = functions.find(name);
      std::vector<Value> args;
      for (auto& a : c->args) args.push_back(eval(a.get()));
      if (it == functions.end()) {
        if (!args.empty()) {
          std::cout << valueToString(args[0]) << std::endl;
          return args[0];
        }
        return Value::makeNil();
      }
      return callFn(it->second, args);
    }
    if (auto* d = dynamic_cast<DrawcallExpr*>(e)) return lookup(d->name);
    throw std::runtime_error("bad expression");
  };

  callFn = [&](FnDeclStmt* fn, const std::vector<Value>& args) -> Value {
    scopes.emplace_back();
    for (size_t i = 0; i < fn->params.size(); ++i) {
      Value v = i < args.size() ? args[i] : Value::makeNil();
      scopes.back()[fn->params[i]] = v;
    }
    ReturnSignal sig;
    execBlock(fn->body.get(), sig);
    scopes.pop_back();
    if (sig.hasValue) return sig.value;
    return Value::makeNil();
  };

  std::function<SceneNode(const PosterItemStmt*)> buildNode;
  buildNode = [&](const PosterItemStmt* item) -> SceneNode {
    SceneNode node;
    node.kind = item->kind;
    node.text = item->text;
    for (auto& p : item->props) node.props[p.key] = valueToString(eval(p.value.get()));
    for (auto& ch : item->children) node.children.push_back(buildNode(ch.get()));
    return node;
  };

  execBlock = [&](BlockStmt* block, ReturnSignal& sig) {
    scopes.emplace_back();
    for (auto& s : block->items) {
      exec(s.get(), sig);
      if (sig.hasValue) break;
    }
    scopes.pop_back();
  };

  exec = [&](Stmt* s, ReturnSignal& sig) {
    if (sig.hasValue) return;
    if (auto* v = dynamic_cast<VarDeclStmt*>(s)) {
      Value init = v->init ? eval(v->init.get()) : Value::makeNil();
      if (v->isConst) {
        consts[v->name] = init;
        scopes.back()[v->name] = init;
      } else {
        assign(v->name, init);
      }
      return;
    }
    if (auto* f = dynamic_cast<FnDeclStmt*>(s)) {
      functions[f->name] = f;
      return;
    }
    if (auto* r = dynamic_cast<ReturnStmt*>(s)) {
      sig.hasValue = true;
      sig.value = r->value ? eval(r->value.get()) : Value::makeNil();
      return;
    }
    if (auto* cond = dynamic_cast<IfStmt*>(s)) {
      if (isTruthy(eval(cond->cond.get()))) execBlock(cond->thenBranch.get(), sig);
      else if (cond->elseBranch) execBlock(cond->elseBranch.get(), sig);
      return;
    }
    if (auto* w = dynamic_cast<WhileStmt*>(s)) {
      int guard = 100000;
      while (isTruthy(eval(w->cond.get())) && guard-- > 0 && !sig.hasValue)
        execBlock(w->body.get(), sig);
      return;
    }
    if (auto* inc = dynamic_cast<IncDecStmt*>(s)) {
      Value cur = lookup(inc->name);
      double n = toNumber(cur) + (inc->isInc ? 1 : -1);
      assign(inc->name, Value::makeNumber(n));
      return;
    }
    if (auto* p = dynamic_cast<PrintStmt*>(s)) {
      std::string out;
      for (auto& a : p->args) out += valueToString(eval(a.get()));
      if (p->mode == "print") std::cout << out;
      else std::cout << out << std::endl;
      return;
    }
    if (auto* poster = dynamic_cast<PosterStmt*>(s)) {
      ScenePoster scene;
      if (!poster->name.empty()) scene.name = poster->name;
      if (poster->width) scene.width = toNumber(eval(poster->width.get()));
      if (poster->height) scene.height = toNumber(eval(poster->height.get()));
      for (auto& pr : poster->props) {
        std::string val = valueToString(eval(pr.value.get()));
        scene.props[pr.key] = val;
        if (pr.key == "background") scene.props["background"] = val;
      }
      for (auto& item : poster->items) scene.elements.push_back(buildNode(item.get()));
      posters.push_back(scene);
      return;
    }
    if (auto* e = dynamic_cast<ExprStmt*>(s)) {
      eval(e->expr.get());
      return;
    }
    if (auto* b = dynamic_cast<BlockStmt*>(s)) {
      execBlock(b, sig);
      return;
    }
  };

  for (auto& top : program.top) {
    if (auto* f = dynamic_cast<FnDeclStmt*>(top.get())) functions[f->name] = f;
    else if (auto* v = dynamic_cast<VarDeclStmt*>(top.get())) {
      Value init = v->init ? eval(v->init.get()) : Value::makeNil();
      defineGlobal(v->name, init, v->isConst);
    } else if (auto* r = dynamic_cast<ReturnStmt*>(top.get())) {
      exitCode = r->value ? static_cast<int>(toNumber(eval(r->value.get()))) : 0;
    }
  }
  auto it = functions.find("main");
  if (it != functions.end()) {
    ReturnSignal sig;
    callFn(it->second, {});
  }
  for (auto& scene : posters) {
    std::cout << "===SCENE===" << std::endl;
    std::cout << "{\"name\":\"" << jsonEscape(scene.name) << "\",\"width\":" << scene.width
              << ",\"height\":" << scene.height;
    if (!scene.props.empty()) {
      std::cout << ",\"props\":{";
      bool first = true;
      for (auto& kv : scene.props) {
        if (!first) std::cout << ",";
        first = false;
        std::cout << "\"" << jsonEscape(kv.first) << "\":\"" << jsonEscape(kv.second) << "\"";
      }
      std::cout << "}";
    }
    std::cout << ",\"elements\":[";
    std::function<void(const SceneNode&)> dumpNode = [&](const SceneNode& n) {
      std::cout << "{\"type\":\"" << jsonEscape(n.kind) << "\"";
      if (!n.text.empty()) std::cout << ",\"text\":\"" << jsonEscape(n.text) << "\"";
      if (!n.props.empty()) {
        std::cout << ",\"style\":{";
        bool f = true;
        for (auto& kv : n.props) {
          if (!f) std::cout << ",";
          f = false;
          std::cout << "\"" << jsonEscape(kv.first) << "\":\"" << jsonEscape(kv.second) << "\"";
        }
        std::cout << "}";
      }
      if (!n.children.empty()) {
        std::cout << ",\"children\":[";
        for (size_t i = 0; i < n.children.size(); ++i) {
          if (i) std::cout << ",";
          dumpNode(n.children[i]);
        }
        std::cout << "]";
      }
      std::cout << "}";
    };
    for (size_t i = 0; i < scene.elements.size(); ++i) {
      if (i) std::cout << ",";
      dumpNode(scene.elements[i]);
    }
    std::cout << "]}" << std::endl;
  }
  return exitCode;
}
