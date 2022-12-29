/**
 * Tokenizer spec
 */
const Spec = [
  // ------------------------
  // Whitespace:

  [/^\s+/, null],

  // ------------------------
  // Comments:
  // пропускать однострочные комменатрии

  [/^\/\/.*/, null],

  // пропускать многострочные комменатрии

  [/^\/\*[\s\S]*?\*\//, null],

  // Tegs
  [/^h1/, 'TEG'],
  [/^div/, 'TEG'],
  [/^button/, 'TEG'],
  [/^span/, 'TEG'],

  [/^="[^"]*"/, 'PROPS_VALUE'],
  [/^={[^=}]*}/, 'PROPS_VALUE'],

  // Keywords
  [/^onClick/, 'onClick'],
  [/^className/, 'className'],

  // Symbols and delimiters:
  [/^\(/, '('],
  [/^\)/, ')'],
  [/^\;/, ';'],
  [/^\>/, '>'],
  [/^\<\//, '</'],
  [/^\</, '<'],
  [/^\=/, '='],
  [/^\}/, '}'],
  [/^\{/, '{'],

  // ------------------------
  // Number:

  [/^\d+/, 'NUMBER'],

  // ------------------------
  // String:
  [/[\w\s]+/, 'STRING'],
];

class Tokenizer {
  init(str) {
    this._string = str;
    this._cursor = 0;
  }

  hasMoreToken() {
    return this._cursor < this._string.length;
  }

  isEOF() {
    return this._cursor === this._string.length;
  }

  getNextToken() {
    if (!this.hasMoreToken()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string);

      if (tokenValue === null) {
        continue;
      }

      // пропускать если есть пробелы
      if (tokenType === null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`);
  }

  _match(regexp, string) {
    const matched = regexp.exec(string);

    if (matched === null) {
      return null;
    }

    this._cursor += matched[0].length;
    return matched[0];
  }
}

export { Tokenizer };
