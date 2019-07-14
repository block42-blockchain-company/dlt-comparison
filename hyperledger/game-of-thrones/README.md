# game-of-thrones
This is our game of thrones use case implemented in Hyperledger Fabric with Composer.
In /models there are the .cto files for our business network. They describe
the structure of our transactions and events.
In /logic one can find the logic that gets executed once a transaction is submitted.

Our code was tested with the composer playground (https://composer-playground.mybluemix.net/)
and with the embedded runtime (https://www.npmjs.com/package/composer-runtime-embedded).

To test our code yourself, open a terminal, navigate to the /lib folder, and
run 'composer archive create -t dir -n ../'. This will create a .bna file in the /dist
folder. This .bna can be uploaded to the playground and played around with.

To test it with the embedded runtime, install the node modules mocha and chai as well
as the above mentioned embedded runtime module. Then navigate to /test in your terminal 
and run 'mocha'. All tests should pass of course.