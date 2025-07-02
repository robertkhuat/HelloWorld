import {
  Blockfrost,
  Lucid,
  Addresses,
  fromHex,
  toHex,
  SpendingValidator,
  fromText,
  Data,
  Constr,
} from "https://deno.land/x/lucid@0.20.9/mod.ts";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js"; // chua ro import nay co can thiet khong
import "jsr:@std/dotenv/load"; // chua rong import nay co can thiet khong

const MNEMONIC = Deno.env.get("MNEMONIC");
const BLOCKFROST_ID = Deno.env.get("BLOCKFROST_ID");
const BLOCKFROST_NETWORK = Deno.env.get("BLOCKFROST_NETWORK");

const lucid = new Lucid({
  provider: new Blockfrost(BLOCKFROST_NETWORK, BLOCKFROST_ID),
});

lucid.selectWalletFromSeed(MNEMONIC);

const validator = await readValidator();
const contractAddress = lucid.newScript(validator).toAddress();
console.log("Contract Address: " + contractAddress);

const redeemer = Data.to(new Constr(0, [fromText("Hello, World!")]));
const utxos = await lucid.utxosAt(contractAddress);
const utxo = utxos.find((u) => u.assets.lovelace === 2900000n);
if (!utxo) {
  throw new Error("No UTXO found with 2900000 Lovelace");
}

const address = await lucid.wallet.address();
console.log("Address: " + address);
console.log("UTXO: " + utxo);
const paymentHash = Addresses.inspect(address).payment?.hash;
console.log("Redeemer: " + redeemer);

// Giao dich mo khoa

const tx = await lucid
  .newTx()
  .collectFrom([utxo], redeemer)
  .attachScript(validator)
  .addSigner(paymentHash)
  .commit();

const signedTx = await tx.sign().commit();
const txHash = await signedTx.submit();
console.log(`2900000 Lovelace unlocked from the contract at: Tx ID: ${txHash}`);

async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json"))
    .validators[0];
  return {
    type: "PlutusV3",
    script: validator.compiledCode, // giữ nguyên chuỗi hex CBOR
  };
}
