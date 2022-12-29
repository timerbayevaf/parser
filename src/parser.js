import { Tokenizer } from './tokenizer.js';

class Parser {
  constructor() {
    // push or pop
    this._lastTeg = [];
    this._string = '';
    this._tokenizer = new Tokenizer();
  }

  parse(str) {
    this._string = str;
    this._tokenizer.init(str);

    this._lookahead = this._tokenizer.getNextToken();

    return this.Program();
  }

  Program() {
    return {
      type: 'Program',
      body: this.StatementList(),
    };
  }

  StatementList() {
    const statementList = [this.Statement()];

    while (this._lookahead != null) {
      statementList.push(this.Statement());
    }
    return statementList;
  }

  Statement() {
    return this.ExpressionStatement();
  }

  ExpressionStatement() {
    const expression = this.Expression();

    return {
      type: 'ExpressionStatement',
      expression,
    };
  }

  Expression() {
    switch (this._lookahead.type) {
      case '<':
        return this.ChildrenExpression();
      default:
        return this.Literal();
    }
  }

  ChildrenExpression() {
    let openingElement = this.OpeningElement();
    const children = [];

    while (this._lookahead.type !== '</') {
      // Operator
      children.push(this.Expression());
    }
    const closingElement = this.ClosingElement();

    return {
      type: 'Element',
      children,
      openingElement,
      closingElement,
    };
  }

  PropsExpression() {
    let props = {};
    const token = this.TegLiteral();

    while (this._lookahead.type !== '>') {
      props[this._lookahead.type] = this.Props();
    }

    return {
      name: token.value,
      props,
    };
  }

  Props() {
    switch (this._lookahead.type) {
      case 'className': {
        this._eat('className').value;
        const propsValue = this.PropsValue().value;
        return propsValue;
      }
      case 'onClick': {
        this._eat('onClick');
        const propsValue = this.PropsValue().value;

        return propsValue;
      }
      default:
        return this.Literal();
    }
  }

  OpeningElement() {
    this._eat('<');
    const token = this.PropsExpression();
    this._eat('>');

    return {
      type: 'OpeningElement',
      name: token.name,
      props: token.props,
    };
  }

  ClosingElement() {
    this._eat('</');
    const token = this.TegLiteral();
    this._eat('>');

    return {
      type: 'ClosingElement',
      name: token.value,
    };
  }

  Literal() {
    switch (this._lookahead.type) {
      case 'TEG':
        return this.TegLiteral();
      case 'NUMBER':
        return this.NumbericLiteral();
      case 'STRING':
        return this.StringLiteral();
      case null:
        return this.NullLiteral();
    }

    throw new SyntaxError(
      `Literal: unexpected literal production ${this._lookahead.type}`
    );
  }

  NullLiteral() {
    this._eat('null');
    return {
      type: 'NullLiteral',
      value: null,
    };
  }

  PropsValue() {
    const token = this._eat('PROPS_VALUE');
    return {
      type: 'PropsValue',
      value: token.value.slice(2, -1),
    };
  }

  TegLiteral() {
    const token = this._eat('TEG');
    return {
      type: 'TegLiteral',
      value: token.value,
    };
  }

  StringLiteral() {
    const token = this._eat('STRING');
    return {
      type: 'StringLiteral',
      value: token.value.trim(),
    };
  }

  NumbericLiteral() {
    const token = this._eat('NUMBER');
    return {
      type: 'NumbericLiteral',
      value: Number(token.value),
    };
  }

  _eat(tokenType) {
    const token = this._lookahead;

    if (token === null) {
      throw new SyntaxError(
        `Unexpected ned of input, expected: "${tokenType}"`
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.type}", expected: "${tokenType}" `
      );
    }

    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }

  _isLiteral(tokenType) {
    return (
      tokenType === 'NUMBER' || tokenType === 'STRING' || tokenType === 'null'
    );
  }
}

export { Parser };
