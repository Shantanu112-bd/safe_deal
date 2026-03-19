import { xdr } from "@stellar/stellar-sdk";

function fromScString(val) {
  if (val.switch().value === xdr.ScValType.scvString().value) {
    return val.str().toString();
  }
  if (val.switch().value === xdr.ScValType.scvSymbol().value) {
    return val.sym().toString();
  }
  return "";
}

const sym = xdr.ScVal.scvSymbol("deal_id");
const str = xdr.ScVal.scvString("hello");

console.log("decode sym:", fromScString(sym));
console.log("decode str:", fromScString(str));
