use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction, OutputReference}
use aiken/collection/list


pub type Datum {
    owner: VerificationKeyHash,
}

pub type Redeemer {
    msg: ByteArray,
}

validator hello_world {
    spend(datum: Option<Datum>, redeemer: Redeemer, _ref: OutputReference, self: Transaction) -> Bool {
        expect Some(Datum {owner}) = datum
        let must_say_hello = redeemer.msg == "hello"
        let must_be_signed = list.has(self.extra_signatories, owner)
        must_say_hello && must_be_signed
    }

    else(_){
        fail
    }
}