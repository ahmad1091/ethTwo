const path = require("path");
const fs = require("fs");
const solc = require("solc");

const contractPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const src = fs.readFileSync(contractPath, "utf8");

var input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: src,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};
const stringifiedInput = JSON.stringify(input);
const complied = solc.compile(stringifiedInput);
const parsedContracr = JSON.parse(complied).contracts;
module.exports = parsedContracr["Lottery.sol"]["Lottery"];
