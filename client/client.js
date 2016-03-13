
import "babel-polyfill";

function promiseCreator() {
  return new Promise((resolve, reject) => {
    resolve("hello");
  });
}

async function test() {
  document.write(await promiseCreator());
}

test();

let x = "foo";

function* foo() {
  yield 1;
  yield 2;
  yield 3;
}

for (let i of foo()) {
  document.write(i);
}
