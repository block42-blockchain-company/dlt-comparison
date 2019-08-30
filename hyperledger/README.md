# Hyperledger

This is our game of thrones use case implemented in Hyperledger Fabric with Composer.

In `/models` there are the `.cto` files for our business network. They describe the structure of our transactions and events. In `/logic` one can find the logic that gets executed once a transaction is submitted.

Our code was tested with the composer playground (https://composer-playground.mybluemix.net/) and with the embedded runtime (https://www.npmjs.com/package/composer-runtime-embedded).

To test our code yourself, open a terminal, navigate to the `/lib` folder, and run `composer archive create -t dir -n ../`. This will create a `.bna` file in the `/dist` folder. This `.bna` can be uploaded to the playground and played around with.

To test it with the embedded runtime, install the node modules mocha and chai as well as the above mentioned embedded runtime module. Then navigate to `/test` in your terminal and run `mocha`. All tests should pass of course.

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
