let expect = require('expect.js');

let selenite = require('../index');

describe('api', function() {
  it('#parse', function() {
    expect(selenite.parse).to.be.a(Function);
    expect(selenite.ast).to.be.a(Function);
    expect(selenite.tokens).to.be.a(Function);
  });
});

describe('simple', function() {
  it('none', function() {
    let s = '';
    let res = selenite.parse(s);
    expect(res).to.eql({});
  });
  it('empty', function() {
    let s = 'a{}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[],"_p":[0,0,1]}});
  });
  it('single', function() {
    let s = 'a{color:#F00}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["color","#F00"]]],"_p":[0,0,1]}});
  });
  it('repeat', function() {
    let s = 'a{color:#F00}a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["color","#F00"]],[1,["margin",0]]],"_p":[0,0,1]}});
  });
  it('double', function() {
    let s = 'a{color:#F00}div{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["color","#F00"]]],"_p":[0,0,1]},"div":{"_v":[[1,["margin",0]]],"_p":[0,0,1]}});
  });
  it('insert blank', function() {
    let s = 'a{color:#F00}div{}a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["color","#F00"]],[2,["margin",0]]],"_p":[0,0,1]},"div":{"_v":[],"_p":[0,0,1]}});
  });
  it('multi css', function() {
    let s = 'a{color:#F00;padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["color","#F00"]],[0,["padding",0]]],"_p":[0,0,1]}});
  });
  it('nest', function() {
    let s = 'div a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}}});
  });
  it('nest with single', function() {
    let s = 'div a{margin:0}a{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,["margin",0]]],"_p":[0,0,2]},"_v":[[1,["padding",0]]],"_p":[0,0,1]}});
  });
  it('repeat nest', function() {
    let s = 'div a{margin:0}div a{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,["margin",0]],[1,["padding",0]]],"_p":[0,0,2]}}});
  });
  it('double nest', function() {
    let s = 'div a{margin:0}div span{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}},"span":{"div":{"_v":[[1,["padding",0]]],"_p":[0,0,2]}}});
  });
  it('#id', function() {
    let s = '#id{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"#id":{"_v":[[0,["margin",0]]],"_p":[1,0,0]}});
  });
  it('.class', function() {
    let s = '.c{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".c":{"_v":[[0,["margin",0]]],"_p":[0,1,0]}});
  });
  it('nest .class', function() {
    let s = '.b .c{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".c":{".b":{"_v":[[0,["margin",0]]],"_p":[0,2,0]}}});
  });
  it('multi .class', function() {
    let s = '.b.a.c{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".c.b.a":{"_v":[[0,["margin",0]]],"_p":[0,3,0]}});
  });
  it('long .class', function() {
    let s = '.g.d.a.t.v.x.c.q.u.i{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".x.v.u.t.q.i.g.d.c.a":{"_v":[[0,["margin",0]]],"_p":[0,10,0]}});
  });
  it('combo', function() {
    let s = 'div.test#id{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div.test#id":{"_v":[[0,["margin",0]]],"_p":[1,1,1]}});
  });
  it('combo sort', function() {
    let s = 'div#id.test{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div.test#id":{"_v":[[0,["margin",0]]],"_p":[1,1,1]}});
  });
  it('long nest', function() {
    let s = 'body .test #id div a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"div":{"#id":{".test":{"body":{"_v":[[0,["margin",0]]],"_p":[1,1,3]}}}}}});
  });
  it('*', function() {
    let s = '*{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_v":[[0,["margin",0]]],"_p":[0,0,1]}});
  });
  it('nest *', function() {
    let s = 'div *{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"div":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}}});
  });
  it(',', function() {
    let s = 'div,a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div":{"_v":[[0,["margin",0]]],"_p":[0,0,1]},"a":{"_v":[[0,["margin",0]]],"_p":[0,0,1]}});
  });
  it(',*', function() {
    let s = 'div,*{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div":{"_v":[[0,["margin",0]]],"_p":[0,0,1]},"_*":true,"*":{"_v":[[0,["margin",0]]],"_p":[0,0,1]}});
  });
  it('both tag/class/id', function() {
    let s = '*.a#b{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.#":true,"*.a#b":{"_v":[[0,["margin",0]]],"_p":[1,1,1]}});
  });
  it('*/class', function() {
    let s = '*.a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.":true,"*.a":{"_v":[[0,["margin",0]]],"_p":[0,1,1]}});
  });
  it('*/id', function() {
    let s = '*#a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*#":true,"*#a":{"_v":[[0,["margin",0]]],"_p":[1,0,1]}});
  });
  it('nest */class', function() {
    let s = 'div *.a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.":true,"*.a":{"div":{"_v":[[0,["margin",0]]],"_p":[0,1,2]}}});
  });
  it('nest */id', function() {
    let s = 'div *#a{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*#":true,"*#a":{"div":{"_v":[[0,["margin",0]]],"_p":[1,0,2]}}});
  });
  it('nest tag/class/id', function() {
    let s = 'div *.a#b{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.#":true,"*.a#b":{"div":{"_v":[[0,["margin",0]]],"_p":[1,1,2]}}});
  });
});

describe(':pseudo', function() {
  it(':hover', function() {
    let s = 'a:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,0,2]}]]}});
  });
  it('double', function() {
    let s = 'a:hover:active{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover","active"],{"_v":[[0,["margin",0]]],"_p":[0,0,3]}]]}});
  });
  it('repeat', function() {
    let s = 'a:hover{margin:0}a:hover{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,["margin",0]],[1,["padding",0]]],"_p":[0,0,2]}]]}});
  });
  it('no tagname', function() {
    let s = ':hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,0,1]}]]}});
  });
  it('*', function() {
    let s = '*:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,0,2]}]]}});
  });
  it(',', function() {
    let s = 'a:hover,div:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,0,2]}]]},"div":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,0,2]}]]}});
  });
  it('multi', function() {
    let s = 'a:hover:first-child:last-child{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["last-child","hover","first-child"],{"_v":[[0,["margin",0]]],"_p":[0,0,4]}]]}});
  });
  it('long', function() {
    let s = 'div p a:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"p":{"div":{"_v":[[0,["margin",0]]],"_p":[0,0,4]}}}]]}});
  });
  it('*.', function() {
    let s = '*.a:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.":true,"*.a":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[0,1,2]}]]}});
  });
  it('*#', function() {
    let s = '*#a:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*#":true,"*#a":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[1,0,2]}]]}});
  });
  it('*.#', function() {
    let s = '*.a#b:hover{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.#":true,"*.a#b":{"_:":[[["hover"],{"_v":[[0,["margin",0]]],"_p":[1,1,2]}]]}});
  });
  it('(n)', function() {
    let s = 'a:nth-of-type(3){}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["nth-of-type(3)"],{"_v":[],"_p":[0,0,2]}]]}});
  });
  it('(odd)', function() {
    let s = 'a:nth-of-type(odd){}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["nth-of-type(odd)"],{"_v":[],"_p":[0,0,2]}]]}});
  });
  it('(n+)', function() {
    let s = 'a:nth-of-type(2n+1){}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["nth-of-type(2n+1)"],{"_v":[],"_p":[0,0,2]}]]}});
  });
  it('::first-line', function() {
    let s = 'a::first-line{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_:":[[["first-line"],{"_v":[[0,["margin",0]]],"_p":[0,0,2]}]]}});
  });
});

describe('attr', function() {
  it('single', function() {
    let s = 'a[href="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,1]}]]}});
  });
  it('multi', function() {
    let s = 'a[href="#"][title="123"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["title","=","123"],["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,2,1]}]]}});
  });
  it('repeat', function() {
    let s = 'a[href="#"]{margin:0}a[href="#"]{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]],[1,["padding",0]]],"_p":[0,1,1]}]]}});
  });
  it('*', function() {
    let s = '*[href="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,1]}]]}});
  });
  it('no tagname', function() {
    let s = '[href="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,0]}]]}});
  });
  it(',', function() {
    let s = 'a[href="#"],div[href="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,1]}]]},"div":{"_[":[[[["href","=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,1]}]]}});
  });
  it('$=', function() {
    let s = 'a[href$="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","$=","#"]],{"_v":[[0,["margin",0]]],"_p":[0,1,1]}]]}});
  });
  it('long', function() {
    let s = 'div p a[href$="#"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","$=","#"]],{"p":{"div":{"_v":[[0,["margin",0]]],"_p":[0,1,3]}}}]]}});
  });
  it('*.', function() {
    let s = '*.a[attr]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.":true,"*.a":{"_[":[[[["attr"]],{"_v":[[0,["margin",0]]],"_p":[0,2,1]}]]}});
  });
  it('*#', function() {
    let s = '*#a[attr]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*#":true,"*#a":{"_[":[[[["attr"]],{"_v":[[0,["margin",0]]],"_p":[1,1,1]}]]}});
  });
  it('*.#', function() {
    let s = '*.a#b[attr]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"_*.#":true,"*.a#b":{"_[":[[[["attr"]],{"_v":[[0,["margin",0]]],"_p":[1,2,1]}]]}});
  });
});

describe('relation', function() {
  it('single', function() {
    let s = 'a+div{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div":{"_+":{"a":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}}}});
  });
  it('double', function() {
    let s = '.c~.d,a+div{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".d":{"_~":{".c":{"_v":[[0,["margin",0]]],"_p":[0,2,0]}}},"div":{"_+":{"a":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}}}});
  });
  it('repeat', function() {
    let s = '.c~.d{margin:0}.c~.d{padding:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".d":{"_~":{".c":{"_v":[[0,["margin",0]],[1,["padding",0]]],"_p":[0,2,0]}}}});
  });
  it('*', function() {
    let s = '*+div{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"div":{"_+":{"_*":true,"*":{"_v":[[0,["margin",0]]],"_p":[0,0,2]}}}});
  });
  it('multi', function() {
    let s = 'a+div>.c~span{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"span":{"_~":{".c":{"_>":{"div":{"_+":{"a":{"_v":[[0,["margin",0]]],"_p":[0,1,3]}}}}}}}});
  });
});

describe('mix', function() {
  it('multi', function() {
    let s = '.a:hover.b:active.d[attr]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".d.b.a":{"_:":[[["hover","active"],{"_[":[[[["attr"]],{"_v":[[0,["margin",0]]],"_p":[0,4,2]}]]}]]}});
  });
  it('multi 2', function() {
    let s = '[attr].a[title]#id[class="c"]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({".a#id":{"_[":[[[["title"],["class","=","c"],["attr"]],{"_v":[[0,["margin",0]]],"_p":[1,4,0]}]]}});
  });
  it('*', function() {
    let s = '[attr]:hover[attr2]{margin:0}';
    let res = selenite.parse(s);
    expect(res).to.eql({"_*":true,"*":{"_:":[[["hover"],{"_[":[[[["attr2"],["attr"]],{"_v":[[0,["margin",0]]],"_p":[0,2,1]}]]}]]}});
  });
});

describe('join', function() {
  it('simple', function() {
    let s = 'a{ margin:0; padding:0;\n}';
    let res = selenite.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,["margin",0]],[0,["padding",0]]],"_p":[0,0,1]}});
  });
});
