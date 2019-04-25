# fs19-wodss-client

[Project allocation async](https://dierk.github.io/fs19-wodss-client/ProjectAllocation.html)\
[Project allocation bundle](https://dierk.github.io/fs19-wodss-client/ProjectAllocationBundle.html)


[AllTests from bundle](https://dierk.github.io/fs19-wodss-client/allTests.html)\
[AllTests asynchronous](https://dierk.github.io/fs19-wodss-client/allTestsAsync.html)

## Build instructions

When visiting the repository through github, one can just click on the links above.

When checking out and running the code locally, you either
- have to run a local server like with `npx http-server -c-1` or
- use a bundler like webpack, parcel, or [rollup](https://rollupjs.org), e.g.
  - install a recent node.js and npm
  - install rollup with  `sudo npm install --global rollup`
  - run via `rollup -o allTestsSuiteBundle.js -f es -w . allTestsSuite.js` 
  - create the application bundle via `rollup -o allocationBundle.js -f es components/allocation.js`