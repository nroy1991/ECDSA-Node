import { useState } from "react";
import server from "./server";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

BigInt.prototype.toJSON = function() {       
  return this.toString()
}

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const msg = {
      sender: address,
      amount: parseInt(sendAmount),
    };
    const message = JSON.stringify(msg);
    console.log(message);
    console.log("signing the message");
    console.log(privateKey);
    const signature = signMessage(JSON.stringify(msg), privateKey)
    console.log(signature);
    const sign = JSON.stringify(signature);
    console.log(sign);
    try {
      const {
        data
      } = await server.post(`send`, {
        recipient,
        sign,
        message
      });
      console.log(data);
      setBalance(data.balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes);
  return hash;
}

function signMessage(msg, privateKey) {
  const message = hashMessage(msg);
  return secp256k1.sign(toHex(message), privateKey);
}

export default Transfer;
