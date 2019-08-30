# BigchainDB

This folder contains the implementation of a game of thrones use case realized with BigchainDB

For this project, just type `npm install` in the terminal.
We used the bigchaindb-driver for javascript.
If you want to build your own BigchainDB project, you can follow one of the guides of the official homepage (e.g. https://www.bigchaindb.com/developers/guide/tutorial-piece-of-art/). If you're having problems with the installation (as we had), first make sure that your installing an official release from the release page (https://github.com/bigchaindb/js-bigchaindb-driver/releases) by adding a specific release version to the install command e.g. `npm install bigchaindb-driver@4.1.0`.
If you just type `npm install bigchaindb-driver`, you could download a masterbranch that is work in progress. In the event that you still have problems, maybe you have to change two lines of code in a file as described here https://github.com/bigchaindb/js-bigchaindb-driver/issues/268.

To test our tests in the folder `tests/` install mocha via `npm install --global mocha`. Once installed, you can enter `tests/` and type `mocha` in the command line. This executes the tests and prints out the results.

In `game-of-thrones.js`, we implemented some simple functions that interact with the BigchainDB testnet.
In `test.js` in the `tests/` folder, we implemented tests to assure that our logic in `game-of-thrones.js` is working.
In `main.js`, you can we implemented similar function calls to `game-of-thrones.js` like in `test.js`. The difference is that we didn't assert anything, and it should model an application that uses these game-of-thrones blockchain functions.

## Licence

This project is licensed under the MIT license. For more information see LICENSE.md.

```
The MIT License

Copyright (c) 2019 block42 Blockchain Company GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
