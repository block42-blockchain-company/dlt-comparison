This is the implementation of our game of thrones use case realized with Ethereum.

All use case specific logic is inside GameOfThrones.sol in the 'contracts' folder.  
The tests are in the 'test' folder in GameOfThronesTest.js.  
We deployed the smart contract on the ropsten testnet at address 0xCc7b18575eAa0F0c1fa21B936Fd1c780BA01719a, and the
deployment transaction can be seen here (https://ropsten.etherscan.io/tx/0x78783cfd78c4c19dc6c831d067bebf5e14eec63eb8bd2b56eb61e22018603291).  
To run our test, first install truffle by 'npm install -g truffle', and type 'npm init' in the terminal to install all node dependencies.
By installing truffle, you install the ganache application. Search for 'ganache' in the search bar of your PC, and start it with
a quickstart setup. Then you can type 'truffle test' in the command line to test the contract.
