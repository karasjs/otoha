import homunculus from 'homunculus';
import serialize from './serialize';

class Selenite {
  constructor() {
    this.parser = null;
    this.node = null;
  }

  parse(code, option = {}) {
    this.parser = homunculus.getParser('css');
    this.node = this.parser.parse(code);
    return serialize(this.node, option);
  }

  tokens() {
    return this.ast ? this.parser.lexer.tokens() : null;
  }
  ast() {
    return this.node;
  }
}

export default new Selenite();
