import { Parser } from './parser.js';

const parser = new Parser();

function exec() {
  const program = `
  <h1 className={test} >hello</h1>  <div>
   <button onClick={handleClick}> My botton</button>
   hello
   <span className={test}>hello</span>
   </div>
`;

  const ast = parser.parse(program);

  return ast;
}

const render = exec();

console.warn(JSON.stringify(render, null, 2));
