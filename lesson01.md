# Lesson 01: Hello World Smart Contract

# Table of Contents

1. Hiểu đúng về Datum, Redeemer, Script, ScriptContext
2. Hiểu đúng luồng hoạt động của smart contract
3. Hiểu đúng về handling time
4. Review code: Hello world
5. Quy trình lock và unlock tài sản đơn giản
6. Giải đáp các câu hỏi chưa rõ


## **1. Hiểu đúng về Datum, Redeemer, Script, ScriptContext**
**a. Datum:** là dữ liệu được đính kèm vào UTXO khi nó được khoá trong hợp đồng thông minh. Nó định nghĩa các thông tin/dữ liệu cho UTXO. Đối với bài hello_world, kiểu datum bao gồm các dữ liệu sau: 
- owner: VerificationKeyHash - là mã hash của public key của chủ sở hữu UTXO.
- age: Int - là số nguyên biểu thị tuổi.
- address: ByteArray - lưu trữ địa chỉ của owner.
- phone: ByteArray - lưu trữ số điện thoại của owner.


**b. Redeemer:** là dữ liệu được cung cấp khi mở khoá UTXO từ hợp đồng thông minh. Nó chứa thông tin hoặc điều kiện cần thiết để thoả mã logic của smart contract. Trong bài này, kiểu Redeemer bao gồm: 

- msg: ByteArray - chứa một thông điệp



  
**c. Script:** là mã hợp đồng thông minh định nghĩa logic để khoá/mở khoá UTXO. Trong bài này, script validator helloworld đảm bảo: 

- Thông điệp redeemer phải là "Hello, World!"
- Giao dịch được ký bởi chủ sở hữu


**d. Script Context:** chứa thông tin ngữ cảnh về giao dịch, bao gồm input, output và chữ ký. Nó cho phép validator kiểm tra chi tiết giao dịch.



## **2. Hiểu đúng luồng hoạt động của smart contract hello world**
Hợp đồng thông minh trong bài này hoạt động trong 2 giai đoạn chính: 
- Khoá: Tài sản được gửi đến địa chỉ smart contract kèm theo datum.
- Mở khoá: Tài sản được mở khoá bằng cách cung cấp redeemer hợp lệ và thoả mã điều kiện của hợp đồng

```aiken
// Khai báo thư viên cần thiết
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction, OutputReference}
use aiken/primitive/string
use aiken/collection/list


// Định nghĩa cấu trúc Datum
pub type Datum {
    owner: VerificationKeyHash,
    age: Int,
    address: ByteArray,
    phone: ByteArray,
}
// Đính vào trong UTXO

// Định nghĩa cấu trúc Redeemer
pub type Redeemer {
    msg: ByteArray,
}
// Điều kiện chuộc lại (unlock) UTXO

validator hello_world {
    spend(
        datum: Option<Datum>, 
        redeemer: Redeemer, 
        _ref: OutputReference, 
        self: Transaction
        ) -> Bool {
        
        // Ghi log thông điệp redeemer
        trace @"redeemer": string.from_bytearray(redeemer.msg)
        // Kiểm tra datum có tồn tại và trích xuất owner
        expect Some(Datum {owner, ..}) = datum
        // Kiểm tra thông điệp redeemer là "Hello, World!"
        let must_say_hello = redeemer.msg == "Hello, World!"
        // Kiểm tra giao dịch được ký bởi owner
        let must_be_signed = list.has(self.extra_signatories, owner)
        // Cả hai điều kiện phải đúng
        must_say_hello? && must_be_signed?
    }

    // Thất bại nếu purpose không phải là spend
    else(_){
        fail
    }
}


```

## **3. Hiểu đúng về handling time**

![Mô tả ảnh](URL_hoặc_đường_dẫn_ảnh)

## **4. Review code offchain: Hello world**
=> Check trong file lock.ts và unlock.ts

## **5. Quy trình lock và unlock tài sản đơn giản**

**a.Khoá tài sản**

B1: Kết nối ví và lấy thông tin.

B2: Set up các dữ liệu cần thiết (owner, age, address, phone) để làm inlinedatum trong giao dịch.

B3: Đọc smart contract từ file plutus.json và lấy địa chỉ smart contract.
   
B4: Tạo và gửi giao dịch lock tài sản vào contract với datum đó.


**b.Mở khoá tài sản**

B1: Khởi tạo và kết nối ví.

B2: Đọc smart contract (validator) và lấy địa chỉ contract.

B3: Tạo redeemer phù hợp với logic của smart contract.

B4: Lấy danh sách UTXO tại địa chỉ contract, chọn UTXO muốn unlock (thường dựa vào số lượng ADA hoặc datum).

B5: Lấy lại payment hash (nếu cần cho addSigner hoặc xác thực).

B6: Tạo và gửi giao dịch unlock



## **6. Giải đáp các câu hỏi chưa rõ**

**addSigner():**

**collectFrom():**

**Câu hỏi tình huống 1:** Khi lock/hoặc tương tác với smart contract với 1 Datum. Mình chỉ cần đáp ứng các thông tin của Datum và tiến hành tạo giao dịch. Câu hỏi đặt ra là khi lock thì nó có liên quan gì đến logic của smart contract chưa, hay là logic chỉ dành cho redeemer.

**Câu hỏi tình huống 2:** Trong giao dịch unlock của bài này, tôi chưa thấy sử dụng scriptRef được đính kèm vào trong giao dịch.

**Câu hỏi tình huống 3:** Quy trình áp dụng scriptRef như thế nào? chưa rõ các thành phần?
Có phải là: 

B1: Tạo 1 giao dịch sau: 
``` typescript
const helloworldScript = lucid.newScript({
  type: "PlutusV3",
  script:
    "59010601010032323232323225333002323232323253330073370e900118041baa0011323322533300a3370e900018059baa00513232533300f30110021533300c3370e900018069baa003132533300d3371e6eb8c044c03cdd50042450d48656c6c6f2c20576f726c642100100114a06644646600200200644a66602600229404cc894ccc048cdc78010028a51133004004001375c6028002602a0026eb0c040c044c044c044c044c044c044c044c044c038dd50041bae3010300e37546020601c6ea800c5858dd7180780098061baa00516300c001300c300d001300937540022c6014601600660120046010004601000260086ea8004526136565734aae7555cf2ab9f5742ae881",
});

const tx = await lucid
  .newTx()
  .payToContract(
    contractAddress,
    {
      AsHash: Datum(), // ???
      scriptRef: helloworldScript.script, // adding plutusV3 script to output
    },
    { lovelace: 1000000n }
  )
  .commit();

```


**scriptRef:** là đoạn mã bytecode của script, cho phép tham chiếu script trong giao dịch mà không cần nhúng mã compileCode từ file plutus.json.
=> Giúp tiết kiệm không gian và chi phí giao dịch.
VD: Khánh có 1 UTXO, tạo scriptref , Khánh chi tiêu lại UTXO đó. Ngày xưa thay vì tôi đọc compileCode của Validator. Nhưng tôi không đọc từ đó nữa, mà sử dụng UTXO từ scriptref để chi tiêu.








