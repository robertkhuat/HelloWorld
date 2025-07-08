// import các thư viện cần thiết
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

// B1: Kết nối ví và lấy thông tin.
// Gán các giá trị từ biến môi trường và thực hiện kết nối ví với Lucid
const menomic = Deno.env.get("MNEMONIC");
const blockfrostId = Deno.env.get("BLOCKFROST_ID");
const blockfrostNetwork = Deno.env.get("BLOCKFROST_NETWORK");

const lucid = new Lucid({
  provider: new Blockfrost(blockfrostNetwork, blockfrostId),
});

lucid.selectWalletFromSeed(menomic);
const address = await lucid.wallet.address();
console.log("Address: " + address);

// B2: Set up các dữ liệu cần thiết (owner, age, address, phone) để làm inlinedatum trong giao dịch.
// payment hash lấy ra từ địa chỉ ví để dùng làm trường owner cho datum.
const paymentHash = Addresses.inspect(address).payment?.hash;
if (!paymentHash) {
  throw new Error("Failed to extract payment hash from address");
}

// Tạo inline datum với các trường owner, age, address, phone
// Chú ý: paymentHash là một chuỗi hex, cần chuyển đổi sang định dạng
const datumInline = Data.to(
  new Constr(0, [
    paymentHash,
    BigInt(23),
    fromText("Ha Noi"),
    fromText("0123456789"),
  ])
);

// B3: Đọc smart contract từ file plutus.json và lấy địa chỉ smart contract.
const validator = await readValidator();
const contractAddress = lucid.newScript(validator).toAddress();
console.log("Contract Address: " + contractAddress);

// Hàm để đọc validator từ file plutus.json
// Lưu ý: file này cần được tạo ra từ quá trình biên dịch smart contract
async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json"))
    .validators[0];
  return {
    type: "PlutusV3",
    script: validator.compiledCode, // giữ nguyên chuỗi hex CBOR
  };
}

// B4: Tạo và gửi giao dịch lock tài sản vào contract với datum đó.
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
