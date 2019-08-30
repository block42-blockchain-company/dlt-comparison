# Ethereum

This is the implementation of our game of thrones use case realized with Ethereum.

All use case specific logic is inside `GameOfThrones.sol` in the `contracts` folder.  
The tests are in the 'test' folder in `GameOfThronesTest.js`.
We deployed the smart contract on the Ropsten testnet at address `0xCc7b18575eAa0F0c1fa21B936Fd1c780BA01719a`, and the deployment transaction can be seen here:

```
https://ropsten.etherscan.io/tx/0x78783cfd78c4c19dc6c831d067bebf5e14eec63eb8bd2b56eb61e22018603291
```

To run our test, first install truffle by `npm install -g truffle`, and type `npm init` in the terminal to install all node dependencies. By installing truffle, you install the ganache application. Search for `ganache` in the search bar of your PC, and start it with a quickstart setup. Then you can type `truffle test` in the command line to test the contract.

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
