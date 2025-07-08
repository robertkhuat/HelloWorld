# hello-world

```aiken
// Khai báo thư viện cần thiết để code
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction, OutputReference}
use aiken/primitive/string
use aiken/collection/list



pub type Datum {
    owner: VerificationKeyHash, // Mã hash của payment key hash
    age: Int,
    address: ByteArray,
    phone: ByteArray,
}
// Datum sẽ được chứa trong UTXO

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

        trace @"redeemer": string.from_bytearray(redeemer.msg)
        expect Some(Datum {owner, ..}) = datum // Kiểm tra xem datum có phải là Some(Datum) hay không
        let must_say_hello = redeemer.msg == "Hello, World!" // Kiểm tra xem redeemer
        let must_be_signed = list.has(self.extra_signatories, owner)

        must_say_hello? && must_be_signed?
    }

    // Nếu mục đích chi tiêu không phải là spend thì sẽ fail
    else(_){
        fail
    }
}
```

# Contents

1. Hiểu đúng về Datum, Redeemer, Script, ScriptContext
2. Hiểu đúng luồng hoạt động của smart contract
3. Hiểu đúng về handling time
4. Review lại code đã làm (bài helloworld, và vesting), và mô tả chi tiết.
   => Giải thích:

Datum là dữ liệu sẽ được đính kèm vào UTXO khi lock.
Gồm các trường:

- owner: Hash của public key của chủ sở hữu UTXO
- age, address, phone: Thông tin phụ

Redeemer là dữ liệu được cung cấp khi muốn mở khoá (unlock) UTXO.

Script:

ScriptRef:

- Lưu trữ mã byte của script

ScriptContext:

- Gồm các thông tin về transaction, input, output, ...

**Questions and Answers**

2. Payment hash
   // Ý nghĩa chi tiết cua payment hash:// Addresses.inspect(address) sẽ phân tích (parse) địa chỉ Cardano thành các thành phần chi tiết (payment, stake, v.v).
   // .payment?.hash lấy ra mã băm (hash) của phần payment (khóa thanh toán) trong địa chỉ.
   // Nếu không lấy được payment hash (ví dụ địa chỉ không hợp lệ hoặc không có phần payment), sẽ ném lỗi và dừng chương trình.
   // Tại sao cần payment hash?

// Payment hash thường được dùng làm datum khi gửi ADA vào smart contract, giúp xác định ai là chủ sở hữu hoặc ai có quyền unlock sau này.
// Đây là một phần quan trọng để bảo mật và xác thực trong các ứng dụng smart contract trên Cardano.

---

3. Quy trình lock asset
B1: Kết nối ví và lấy thông tin.

B2: Set up các dữ liệu cần thiết (owner, age, address, phone) để làm inlinedatum trong giao dịch.
   B3: Đọc smart contract từ file plutus.json và lấy địa chỉ smart contract.
   B4: Tạo và gửi giao dịch lock tài sản vào contract với datum đó.

---

4. Quy trình unlock asset
   B1: Khởi tạo và kết nối ví.
   Lấy thông tin ví và kết nối mạng từ biến môi trường
   Khởi tạo đối tượng Lucid để tương tác với Cardano.
   Chọn ví từ mnemonic.
   B2: Đọc smart contract (validator) và lấy địa chỉ contract.
   Đọc script validator từ file plutus.json.
   Tạo địa chỉ hợp đồng thông minh từ validator.
   B3: Tạo redeemer phù hợp với logic của smart contract.
   Tạo redeemer với thông điệp "Hello, World!" (phù hợp với logic của smc)
   B4: Lấy danh sách UTXO tại địa chỉ contract, chọn UTXO muốn unlock (thường dựa vào số lượng ADA hoặc datum).
   Lấy tất cả UTXO tại địa chỉ hợp đồng.
   Tìm UTXO có đúng số lượng ADA cần unlock.
   B5: Lấy lại payment hash (nếu cần cho addSigner hoặc xác thực).
   B6: Tạo và gửi giao dịch unlock:

Sử dụng .collectFrom([utxo], redeemer) để lấy UTXO ra khỏi contract.
Đính kèm script và add signer nếu cần.
Ký và submit giao dịch lên blockchain.
addSigner() là gì?
collectFrom() là gì?

scriptRef: là

VD:Khánh có 1 UTXO, tạo scriptref , ông chi tiêu lại UTXO đó. Ngày xưa thay vì tôi đọc compileCode của Validator.
Nhưng tôi không đọc từ đó nữa, mà sử dụng UTXO từ scriptref để chi tiêu.

---

Các phần chưa rõ:

1. addSigner() là gì?
2. collectFrom() là gì?
3. scriptRef là gì?
4. Trong unlock tài sản, không thấy áp dụng scriptRef
5. Chưa rõ thông tin trong phần build giao dịch của file scriptRef
