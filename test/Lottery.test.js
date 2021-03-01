const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const compiledContract = require("../compile");
const bytecode = compiledContract.evm.bytecode.object;
const abi = compiledContract.abi;

let accounts, lottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("did the account entered properly?", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(1, players.length);
    assert.strictEqual(accounts[0], players[0]);
  });
  it("did  multiple accounts entered properly?", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(3, players.length);
    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(accounts[1], players[1]);
    assert.strictEqual(accounts[2], players[2]);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 200,
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can pick a winner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("returns manager", async () => {
    const manager = await lottery.methods.manager().call({
      from: accounts[0],
    });
    assert.ok(manager);
  });

  it("sends money to the winner and restes the players array", async () => {
    let initialBalances = {};
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });
    initialBalances[accounts[0]] = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether"),
    });
    initialBalances[accounts[1]] = await web3.eth.getBalance(accounts[1]);

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("2", "ether"),
    });
    initialBalances[accounts[2]] = await web3.eth.getBalance(accounts[2]);

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const winner = await lottery.methods.returnWinnerAdress().call({
      from: accounts[0],
    });
    const winnerBalance = await web3.eth.getBalance(winner);

    const difference = winnerBalance - initialBalances[winner];
    assert(difference > web3.utils.toWei("1.8", "ether"));

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(0, players.length);
  });
});
