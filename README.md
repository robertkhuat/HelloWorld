# hello-world

Write validators in the `validators` folder, and supporting functions in the `lib` folder using `.ak` as a file extension.

```aiken
validator my_first_validator {
  spend(_datum: Option<Data>, _redeemer: Data, _output_reference: Data, _context: Data) {
    True
  }
}
```

## Building

```sh
aiken build
```

## Configuring

**aiken.toml**

```toml
[config.default]
network_id = 41
```

Or, alternatively, write conditional environment modules under `env`.

## Testing

You can write tests in any module using the `test` keyword. For example:

```aiken
use config

test foo() {
  config.network_id + 1 == 42
}
```

To run all tests, simply do:

```sh
aiken check
```

To run only tests matching the string `foo`, do:

```sh
aiken check -m foo
```

## Documentation

If you're writing a library, you might want to generate an HTML documentation for it.

Use:

```sh
aiken docs
```

## Resources

Find more on the [Aiken's user manual](https://aiken-lang.org).

# AikenAwesome

**Questions and Answers**

1. Cach doc inline datum ntn?
   //

2. Payment hash
   // Ý nghĩa chi tiết cua payment hash:
   // Addresses.inspect(address) sẽ phân tích (parse) địa chỉ Cardano thành các thành phần chi tiết (payment, stake, v.v).
   // .payment?.hash lấy ra mã băm (hash) của phần payment (khóa thanh toán) trong địa chỉ.
   // Nếu không lấy được payment hash (ví dụ địa chỉ không hợp lệ hoặc không có phần payment), sẽ ném lỗi và dừng chương trình.
   // Tại sao cần payment hash?

// Payment hash thường được dùng làm datum khi gửi ADA vào smart contract, giúp xác định ai là chủ sở hữu hoặc ai có quyền unlock sau này.
// Đây là một phần quan trọng để bảo mật và xác thực trong các ứng dụng smart contract trên Cardano.

3. Quy trình lock asset
   B1: Kết nối ví và lấy thông tin.
   B2: Lấy payment hash để làm datum.
   B3: Đọc smart contract.
   B4: Tạo datum inline từ payment hash.
   B5: Lấy địa chỉ contract.
   B6: Tạo và gửi giao dịch lock tài sản vào contract với datum đó.

4. Quy trình unlock asset
   B1: Kết nối ví và lấy thông tin.
   B2: Đọc smart contract (validator).
   B3: Lấy địa chỉ contract.
   B4: Tạo redeemer phù hợp với logic của smart contract.
   B5: Lấy danh sách UTXO tại địa chỉ contract, chọn UTXO muốn unlock (thường dựa vào số lượng ADA hoặc datum).
   B6: Lấy lại payment hash (nếu cần cho addSigner hoặc xác thực).
   B7: Tạo và gửi giao dịch unlock:

Sử dụng .collectFrom([utxo], redeemer) để lấy UTXO ra khỏi contract.
Đính kèm script và add signer nếu cần.
Ký và submit giao dịch lên blockchain.
