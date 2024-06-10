## Setting up

Run the following commands in sequence

nix develop
cd ethgild
npm i
forge build
cd ..
npm run codegen

This will generate the required JS actions for making contract calls with @wagmi/cli
