import { xdr } from "@stellar/stellar-sdk";

export const fromScString = (val) => {
  if (!val) return "";
  try {
    if (val.switch().value === xdr.ScValType.scvString().value) {
      return val.str().toString();
    }
    if (val.switch().value === xdr.ScValType.scvSymbol().value) {
      return val.sym().toString();
    }
    return "";
  } catch {
    return "";
  }
};

export const fromScMap = (val) => {
  const result = {};
  if (!val) return result;
  try {
    if (val.switch().value === xdr.ScValType.scvMap().value) {
      const entries = val.map();
      if (entries) {
        for (const entry of entries) {
          const key = fromScString(entry.key()) || entry.key().switch().name;
          result[key] = entry.val();
        }
      }
    }
  } catch (e) {
    console.log("Error in fromScMap:", e);
  }
  return result;
};

// Create an xdr.ScMap
const entry1 = new xdr.ScMapEntry({
  key: xdr.ScVal.scvSymbol("deal_id"),
  val: xdr.ScVal.scvString("DEAL-1")
});

const entry2 = new xdr.ScMapEntry({
  key: xdr.ScVal.scvString("description"),
  val: xdr.ScVal.scvString("Testing the map decoder")
});

const mapVal = xdr.ScVal.scvMap([entry1, entry2]);

const decoded = fromScMap(mapVal);
console.log("Decoded MAP keys:", Object.keys(decoded));
