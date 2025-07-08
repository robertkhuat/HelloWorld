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
import { scriptRef } from "./lock.ts";

const menomic = Deno.env.get("MNEMONIC");
const blockfrostId = Deno.env.get("BLOCKFROST_ID");
const blockfrostNetwork = Deno.env.get("BLOCKFROST_NETWORK");
// Khong lam gi ca
const Datum = () => Data.void();
const Redeemer = () => Data.void();

const lucid = new Lucid({
  provider: new Blockfrost(blockfrostNetwork, blockfrostId),
});

lucid.selectWalletFromSeed(menomic);
const address = await lucid.wallet.address();
console.log("Address: " + address);
const validator = await readValidator();

const helloworldScript = lucid.newScript({
  type: "PlutusV3",
  script:
    "59010601010032323232323225333002323232323253330073370e900118041baa0011323322533300a3370e900018059baa00513232533300f30110021533300c3370e900018069baa003132533300d3371e6eb8c044c03cdd50042450d48656c6c6f2c20576f726c642100100114a06644646600200200644a66602600229404cc894ccc048cdc78010028a51133004004001375c6028002602a0026eb0c040c044c044c044c044c044c044c044c044c038dd50041bae3010300e37546020601c6ea800c5858dd7180780098061baa00516300c001300c300d001300937540022c6014601600660120046010004601000260086ea8004526136565734aae7555cf2ab9f5742ae881",
});

const contractAddress = lucid.newScript(validator).toAddress();
const tx = await lucid
  .newTx()
  .payToContract(
    contractAddress,
    {
      AsHash: Datum(),
      scriptRef: helloworldScript.script, // adding plutusV2 script to output
    },
    { lovelace: 1000000n }
  )
  .commit();

const signedTx = await tx.sign().commit();
const txHash = await signedTx.submit();
console.log(
  `1000000 Lovelace locked into the contract at:    Tx ID: ${txHash} `
);

async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json"))
    .validators[0];
  return {
    type: "PlutusV3",
    script: validator.compiledCode, // giữ nguyên chuỗi hex CBOR
  };
}
