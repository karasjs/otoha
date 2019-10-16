import homunculus from 'homunculus';
import join from './join';
import sort from './sort';

let Token = homunculus.getClass('token', 'css');
let Node = homunculus.getClass('node', 'css');

let idx;

function parse(node) {
  idx = 0;
  let res = {};
  node.leaves().forEach(function(leaf, i) {
    if(leaf.name() === Node.STYLESET) {
      styleset(leaf, res);
    }
  });
  return res;
}

function styleset(node, res) {
  let sels = selectors(node.first());
  let styles = block(node.last());
  let i = idx++;
  sels.forEach(function(sel) {
    record(sel, i, styles, res);
  });
}
function selectors(node) {
  let res = [];
  node.leaves().forEach(function(leaf) {
    if(leaf.name() === Node.SELECTOR) {
      res.push(selector(leaf));
    }
  });
  return res;
}
function selector(node) {
  return node.leaves().map(function(leaf) {
    return leaf.token();
  });
}
function block(node) {
  let res = [];
  node.leaves().forEach(function(leaf) {
    if(leaf.name() === Node.STYLE) {
      res.push(style(leaf));
    }
  });
  return res;
}
function style(node) {
  let s = join(node, true).trim();
  s = s.replace(/;$/, '');
  return s;
}

function record(sel, idx, styles, res) {
  let _p = [0, 0, 0];
  for(let i = sel.length - 1; i >= 0; i--) {
    let temp = {
      s: [],
      a: [],
      p: []
    };
    let t = sel[i];
    let s = t.content();
    priority(t, s, _p);
    switch(t.type()) {
      case Token.SELECTOR:
        temp.s.push(s);
        break;
      case Token.PSEUDO:
        let s2 = s.replace(/^:+/, '');
        if(sel[i].content() === '(') {
          s2 += '(';
          for(let j = i + 1; j < sel.length; j++) {
            if(sel[j].content() === ')') {
              s2 += ')';
              break;
            }
            s2 += sel[j].content();
          }
        }
        temp.p.push(s2);
        break;
      case Token.SIGN:
        switch(s) {
          case ']':
            let item = [];
            i--;
            t = t.prev();
            while(t) {
              s = t.content();
              if(s === '[') {
                break;
              }
              i--;
              t = t.prev();
              s = s.replace(/^(['"])(.*)\1$/, '$2');
              item.unshift(s);
            }
            temp.a.push({
              v: item,
              s: item.join('')
            });
            break;
          case '+':
          case '>':
          case '~':
            s = '_' + s;
            res[s] = res[s] || {};
            res = res[s];
            continue;
          //忽略掉()，因为其出现在:nth-child(n)中
          case ')':
            i--;
            t = t.prev();
            while(t) {
              s = t.content();
              if(s === '(') {
                break;
              }
              i--;
              t = t.prev();
            }
            break;
        }
        break;
    }
    t = t.prev();
    while(t && !isSplit(t)) {
      s = t.content();
      priority(t, s, _p);
      switch(t.type()) {
        case Token.SELECTOR:
          temp.s.push(s);
          break;
        case Token.PSEUDO:
          let s2 = s.replace(/^:+/, '');
          if(sel[i].content() === '(') {
            s2 += '(';
            for(let j = i + 1; j < sel.length; j++) {
              if(sel[j].content() === ')') {
                s2 += ')';
                break;
              }
              s2 += sel[j].content();
            }
          }
          temp.p.push(s2);
          break;
        case Token.SIGN:
          switch(s) {
            case ']':
              let item = [];
              i--;
              t = t.prev();
              while(t) {
                s = t.content();
                if(s === '[') {
                  break;
                }
                i--;
                t = t.prev();
                s = s.replace(/^(['"])(.*)\1$/, '$2');
                item.unshift(s);
              }
              temp.a.push({
                v: item,
                s: item.join('')
              });
              break;
            case '+':
            case '>':
            case '~':
              s = '_' + s;
              res[s] = res[s] || {};
              res = res[s];
              continue;
            //忽略掉()，因为其出现在:nth-child(n)中
            case ')':
              i--;
              t = t.prev();
              while(t) {
                s = t.content();
                if(s === '(') {
                  break;
                }
                i--;
                t = t.prev();
              }
              break;
          }
          break;
      }
      t = t.prev();
      i--;
    }
    res = save(temp, res);
  }
  res._v = res._v || [];
  styles.forEach(function(style) {
    res._v.push([idx, style.split(':')]);
  });
  res._p = _p;
}

function priority(token, s, p) {
  switch(token.type()) {
    case Token.SELECTOR:
      if(s.charAt(0) === '#') {
        p[0]++;
      }
      else if(s.charAt(0) === '.') {
        p[1]++;
      }
      else {
        p[2]++;
      }
      break;
    case Token.PSEUDO:
      p[2]++;
      break;
    case Token.SIGN:
      if(s === ']') {
        p[1]++;
      }
      break;
  }
}

function isSplit(token) {
  if(token.type() === Token.BLANK) {
    return true;
  }
  if(token.type() === Token.LINE) {
    return true;
  }
  if(token.type() === Token.SIGN) {
    return ['>', '+', '~', '{', '}', ','].indexOf(token.content()) > -1;
  }
  return false;
}

function save(temp, res) {
  if(!temp.s.length) {
    temp.s.push('*');
  }
  //selector按name/class/id排序
  sort(temp.s, function(a, b) {
    return a !== '*' && a < b || b === '*';
  });
  let star = temp.s[0] === '*';
  //*开头有几种组合，记录之
  if(star) {
    res['_*'] = true;
    if(temp.s.length > 1) {
      if(temp.s.length > 2) {
        res['_*.#'] = true;
      }
      else if(temp.s[1][0] === '.') {
        res['_*.'] = true;
      }
      else {
        res['_*#'] = true;
      }
    }
  }
  let s = temp.s.join('');
  res[s] = res[s] || {};
  res = res[s];
  //伪类
  if(temp.p.length) {
    res['_:'] = res['_:'] || [];
    let pseudos = res['_:'];
    let pseudo = [];
    temp.p.forEach(function(item) {
      //防止多次重复
      if(pseudo.indexOf(item) === -1) {
        pseudo.push(item);
      }
    });
    //排序后比对，可能重复，合并之如a:hover{...}a:hover{...}会生成2个hover数组
    sort(pseudo, function(a, b) {
      return a < b;
    });
    let isExist = -1;
    for(let j = 0, len = pseudos.length; j < len; j++) {
      if(pseudos[j][0].join(',') === pseudo.join(',')) {
        isExist = j;
        break;
      }
    }
    if(isExist > -1) {
      res = pseudos[isExist][1];
    }
    else {
      let arr = [];
      arr.push(pseudo);
      res = {};
      arr.push(res);
      pseudos.push(arr);
    }
  }
  //属性
  if(temp.a.length) {
    res['_['] = res['_['] || [];
    let attrs = res['_['];
    let attr = [];
    //去重并排序
    sort(temp.a, function(a, b) {
      return a.s < b.s;
    });
    let hash = {};
    temp.a.forEach(function(item) {
      if(!hash.hasOwnProperty(item.s)) {
        attr.push(item.v);
      }
    });
    let isExist = -1;
    let join = '';
    join += attr.map(function(item) {
      return item.join('');
    });
    for(let j = 0, len = attrs.length; j < len; j++) {
      let s1 = '';
      s1 += attrs[j][0].map(function(item) {
        return item.join('');
      });
      if(s1 === join) {
        isExist = j;
        break;
      }
    }
    if(isExist > -1) {
      res = attrs[isExist][1];
    }
    else {
      let arr = [];
      arr.push(attr);
      res = {};
      arr.push(res);
      attrs.push(arr);
    }
  }
  return res;
}

export default parse;
