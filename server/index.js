const {toHex} = require("ethereum-cryptography/utils");
const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 }  = require("ethereum-cryptography/keccak");
var JSONbig = require('json-bigint');
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03b7ba5197d595b178dd73222211305068cab35ba99f23086f2d79874e223b98ff": 100, // privateKey: 72a13e45bfb137743e3f67509f1856b77af71aade9d73aa04ea882b14d4694d7
  "03382a9f2e96656adbc40d71dd07107785bf81b0de6db05e51dafdd44e0f21d684": 50,  // privateKey: 49f3084b9029b5c517a8d801d8e0349658db3288c20648357d2dd281b3ebe263
  "0340f36f158ef51113c8a4fd17eb5b23eca515c979cb3ad5ae7a92015a9db6952f": 75,  // privateKey: 5f67860425dc970f9ffd936958a722a6142572c7f7505e7877f2902de17ecf89
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  console.log(balance);
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { recipient,
    sign,
    message } = req.body;
    console.log(sign);
    const msg = JSON.parse(message);
    const signObj = JSONbig.parse(sign);
    console.log(signObj);
    const signObj2 = {r : BigInt(signObj.r), s: BigInt(signObj.s)};
    console.log(signObj2);

  const isValid = secp.secp256k1.verify(signObj2, hashMessage(message), msg.sender);

  if (!isValid) {
    console.log("private Key is wrong");
    res.send({message : "private key is wrong"});
    return;
  }

  const sender = msg.sender;
  const amount = msg.amount;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes);
  return hash;
}