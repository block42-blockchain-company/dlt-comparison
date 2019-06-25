This is the implementation of our game of thrones use case done with 0bsnetwork (Zero bullshit network).
We are using the 0bs javascript API. There are also APIs for python, java, C-Sharp (https://github.com/0bsnetwork)

game-of-thrones.js contains the logic functions  
main.js calls the functions of game-of-thrones.js as if it was a real application.  
test.js contains test cases asserting that the logic in game-of-thrones.js works.  

Type "npm install" to install the packages chai and the 0bs library.  
An account on the 0bs testnet is needed with some Zbs coins for the transaction fees. You can easily create one here https://client.testnet-0bsnetwork.com/
and to get some coins visit the faucet and type in the address of your account (https://explorer.0bsnetwork.com/faucet).
The "phrase" that is imported in game-of-thrones.js is the mnemonic seed of your account.
We issued data transactions as described in the official documentation https://docs.0bsnetwork.com/technical-details/data-transaction .
The test cases can be executed by installing mocha via npm and executing "mocha" in the command line.  
The tests can take very long because we have to wait for new blocks to be created on the 0bs testnet. Average block time is around 1 minute.  
