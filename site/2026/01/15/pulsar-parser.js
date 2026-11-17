/*

<expression> ::= <term> <expression'>
<expression'> ::= "+" <term> <expression'> | "-" <term> <expression'> | ε

<term> ::= <factor> <term'>
<term'> ::= "*" <factor> <term'> | "/" <factor> <term'> | ε

<factor> ::= "-" <factor> | "(" <expression> ")" | <value>

<value> ::= "x" | "y" | "t" | <cos> | <sin> | "pi" | <number>

<cos> ::= "cos" "(" <expression> ")"

<sin> ::= "sin" "(" <expression> ")"

<number> ::= <digits> <fraction>
<fraction> ::= "." <digits> | ε

<digits> ::= <digit> <digits> | <digit>

<digit> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

*/

const TokenTypes = {
  close: "close",
  cos: "cos",
  digit: "digit",
  divide: "divide",
  dot: "dot",
  EOF: "EOF",
  minus: "minus",
  multiply: "multiply",
  open: "open",
  pi: "pi",
  plus: "plus",
  sin: "sin",
  t: "t",
  x: "x",
  y: "y",
};

function tokenise(input) {
  const tokens = [];
  let position = 0;

  function next() {
    return input[position++];
  }

  function expect(expected) {
    const actual = next();

    if (actual !== expected) {
      throw new Error(`Unexpected character: ${actual}`);
    }
  }

  function addToken(type, value) {
    tokens.push({ t: type, v: value ?? "" });
  }

  let c;

  while ((c = next()) !== undefined) {
    if (c === "(") {
      addToken(TokenTypes.open);
    } else if (c === ")") {
      addToken(TokenTypes.close);
    } else if (c === "+") {
      addToken(TokenTypes.plus);
    } else if (c === "-") {
      addToken(TokenTypes.minus);
    } else if (c === "*") {
      addToken(TokenTypes.multiply);
    } else if (c === "/") {
      addToken(TokenTypes.divide);
    } else if (c === ".") {
      addToken(TokenTypes.dot);
    } else if (
      c === "0" ||
      c === "1" ||
      c === "2" ||
      c === "3" ||
      c === "4" ||
      c === "5" ||
      c === "6" ||
      c === "7" ||
      c === "8" ||
      c === "9"
    ) {
      addToken(TokenTypes.digit, c);
    } else if (c === " " || c === "\t") {
      // ignore whitespace
    } else if (c === "x") {
      addToken(TokenTypes.x);
    } else if (c === "y") {
      addToken(TokenTypes.y);
    } else if (c === "t") {
      addToken(TokenTypes.t);
    } else if (c === "c") {
      expect("o");
      expect("s");
      addToken(TokenTypes.cos);
    } else if (c === "s") {
      expect("i");
      expect("n");
      addToken(TokenTypes.sin);
    } else if (c === "p") {
      expect("i");
      addToken(TokenTypes.pi);
    } else {
      throw new Error("Unexpected character: " + c);
    }
  }

  addToken(TokenTypes.EOF);
  return tokens;
}

const Expressions = {
  cos: (e) => (env) => Math.cos(e(env)),
  divide: (e1, e2) => (env) => e1(env) / e2(env),
  minus: (e1, e2) => (env) => e1(env) - e2(env),
  multiply: (e1, e2) => (env) => e1(env) * e2(env),
  negate: (e) => (env) => 0 - e(env),
  number: (value) => () => parseFloat(value),
  pi: () => () => Math.PI,
  plus: (e1, e2) => (env) => e1(env) + e2(env),
  sin: (e) => (env) => Math.sin(e(env)),
  t: () => (env) => env.t,
  x: () => (env) => env.x,
  y: () => (env) => env.y,
};

function parse(tokens) {
  let position = -1;
  let token;

  function next() {
    token = tokens[++position];
    return token;
  }

  function peek() {
    return tokens[position + 1];
  }

  function accept(type) {
    if (peek()?.t === type) {
      next();
      return true;
    }

    return false;
  }

  function expect(type) {
    const token = peek();

    if (!accept(type)) {
      throw new Error(`expect: ${token?.t} !== ${type}`);
    }

    return token;
  }

  function digits() {
    let accumulator = "";

    while (accept(TokenTypes.digit)) {
      accumulator += token.v;
    }

    return accumulator;
  }

  function number() {
    const whole = digits();

    if (whole === "") {
      throw new Error(`number: unexpected ${peek()?.t}`);
    }

    if (!accept(TokenTypes.dot)) {
      return Expressions.number(whole);
    }

    const fraction = digits();

    if (fraction === "") {
      throw new Error("number: no digits after the decimal point");
    }

    return Expressions.number(`${whole}.${fraction}`);
  }

  function value() {
    if (accept(TokenTypes.x)) {
      return Expressions.x();
    }

    if (accept(TokenTypes.y)) {
      return Expressions.y();
    }

    if (accept(TokenTypes.t)) {
      return Expressions.t();
    }

    if (accept(TokenTypes.cos)) {
      expect(TokenTypes.open);

      const e = expression();

      expect(TokenTypes.close);

      return Expressions.cos(e);
    }

    if (accept(TokenTypes.sin)) {
      expect(TokenTypes.open);

      const e = expression();

      expect(TokenTypes.close);

      return Expressions.sin(e);
    }

    if (accept(TokenTypes.pi)) {
      return Expressions.pi();
    }

    return number();
  }

  function factor() {
    if (accept(TokenTypes.minus)) {
      return Expressions.negate(factor());
    }

    if (accept(TokenTypes.open)) {
      const e = expression();

      expect(TokenTypes.close);

      return e;
    }

    return value();
  }

  function term() {
    let e = factor();

    while (accept(TokenTypes.multiply) || accept(TokenTypes.divide)) {
      const operator =
        token.t === TokenTypes.multiply
          ? Expressions.multiply
          : Expressions.divide;
      e = operator(e, factor());
    }

    return e;
  }

  function expression() {
    let e = term();

    while (accept(TokenTypes.plus) || accept(TokenTypes.minus)) {
      const operator =
        token.t === TokenTypes.plus ? Expressions.plus : Expressions.minus;
      e = operator(e, term());
    }

    return e;
  }

  const e = expression();

  expect(TokenTypes.EOF);

  return e;
}

export function execute(input, env) {
  return parse(tokenise(input))(env);
}
