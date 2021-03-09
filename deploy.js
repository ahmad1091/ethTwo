const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledContract = require("./compile");
require("dotenv").config();
const bytecode = compiledContract.evm.bytecode.object;
const abi = compiledContract.abi;

const mnemonicPhrase = proccess.env.mnemonicPhrase;

let provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonicPhrase,
  },
  providerOrUrl:
    "https://rinkeby.infura.io/v3/190d2e2670274a3183a86804ddee1ee3",
});

const web3 = new Web3(provider);

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    console.log("extracted accounts", accounts[0]);

    const result = await new web3.eth.Contract(abi)
      .deploy({
        data: "0x" + bytecode,
      })
      .send({
        from: accounts[0],
      });

    console.log(abi);
    console.log("Adress =>", result.options.address);
    process.exit(1);
  } catch (err) {
    console.error(err);
  }
};

deploy();
