import {
  Blockfrost,
  Lucid,
  Addresses,
  fromHex,
  toHex,
  fromText,
  Data,
  Constr,
} from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";

const menomic = Deno.env.get("MNEMONIC");
const blockfrostId = Deno.env.get("BLOCKFROST_ID");
const blockfrostNetwork = Deno.env.get("BLOCKFROST_NETWORK");

const lucid = new Lucid({
  provider: new Blockfrost(blockfrostNetwork, blockfrostId),
});

lucid.selectWalletFromSeed(menomic);
const address = await lucid.wallet.address();
console.log("Address: " + address);

// payment hash de lam gi?
const paymentHash = Addresses.inspect(address).payment?.hash;
if (!paymentHash) {
  throw new Error("Failed to extract payment hash from address");
}

const Datum = Data.Object({
  owner: Data.Bytes(),
  age: Data.Integer(),
  address: Data.Bytes(),
  phone: Data.Bytes(),
});

const validator = await readValidator();
const datumInline = Data.to(
  new Constr(0, [
    paymentHash,
    BigInt(23),
    fromText("Ha Noi"),
    fromText("0123456789"),
  ])
);
const contractAddress = lucid.newScript(validator).toAddress();

console.log("Contract Address: " + contractAddress);

const tx = await lucid
  .newTx()
  .payToContract(
    contractAddress,
    { Inline: datumInline },
    { lovelace: 2900000n }
  )
  .commit();
const signedTx = await tx.sign().commit();
const txHash = await signedTx.submit();
console.log(
  `2900000 Lovelace locked into the contract at:    Tx ID: ${txHash} `
);

async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json"))
    .validators[0];
  return {
    type: "PlutusV3",
    script: validator.compiledCode, // giữ nguyên chuỗi hex CBOR
  };
}
