use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction, OutputReference}
use aiken/primitive/string
use aiken/collection/list


pub type Datum {
    owner: VerificationKeyHash,
}

pub type Redeemer {
    msg: ByteArray,
}

validator hello_world {
    spend(
        datum: Option<Datum>, 
        redeemer: Redeemer, 
        _ref: OutputReference, 
        self: Transaction
        ) -> Bool {
        
        trace @"redeemer": string.from_bytearray(redeemer.msg)
        expect Some(Datum {owner}) = datum
        let must_say_hello = redeemer.msg == "Hello, World!"
        let must_be_signed = list.has(self.extra_signatories, owner)
        
        must_say_hello? && must_be_signed?
    }

    else(_){
        fail
    }
}




// Test validator

test hello_world_example() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
 
  let redeemer = Redeemer { msg: "Hello, World!" }
 
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
 
  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}