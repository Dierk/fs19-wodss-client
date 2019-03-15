# fs19-wodss-client

[View content as HTML](https://dierk.github.io/fs19-wodss-client/)

[AllTests from bundle](https://dierk.github.io/fs19-wodss-client/allTests.html)\
[AllTests asynchronous](https://dierk.github.io/fs19-wodss-client/allTestsAsync.html)


## Build instructions

For running the code that is build on the ES6 module system you either
- have to run a local server like with `npx http-server -c-1` or
- use a bundler like webpack, parcel, or [rollup](https://rollupjs.org), e.g.
  - install a recent node.js and npm
  - install rollup with  `sudo npm install --global rollup`
  - run via `rollup -o allTestsSuiteBundle.js -f es -w . allTestsSuite.js` 