import { rpc, Contract, Address, Networks, Keypair, TransactionBuilder, Account, BASE_FEE } from "@stellar/stellar-sdk";

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org", { allowHttp: true });
const contractId = "CDNK66APDPFR4IG5DNNV2RJBZEXNMVRYGU7XKZCFV5TU7AFUPZVLBS7Y";

async function main() {
  const contract = new Contract(contractId);

  // Use ANY valid testnet address - just generate one to test the simulation fix
  // The seller address from the user's wallet starts with GD5QVX... BASH
  // From the screenshot sidebar: GD5QVXWGR3Y5O27UBCQQZYNAKNIHMYT...
  // Let's just use a random valid keypair to test the fix works at all
  const testKeypair = Keypair.random();
  const sellerAddress = testKeypair.publicKey();
  
  console.log("Testing with random address:", sellerAddress);
  
  // This is the FIX — use a mock Account instead of fetching a random one
  const randomSource = Keypair.random().publicKey();
  const account = new Account(randomSource, "0");
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("get_seller_deals", new Address(sellerAddress).toScVal()))
    .setTimeout(30)
    .build();

  console.log("Simulating get_seller_deals...");
  const sim = await rpcServer.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationError(sim)) {
    console.log("SIMULATION ERROR:", JSON.stringify(sim, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
    return;
  }
  
  if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
    const val = sim.result.retval;
    console.log("✅ SUCCESS! XDR type:", val.switch().name);

    if (val.switch().name === "scvVec") {
      const vec = val.vec() || [];
      console.log("Number of deals:", vec.length);
    } else {
      console.log("Returned value type:", val.switch().name);
    }
  } else {
    console.log("No result:", JSON.stringify(sim, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
  }
}

main().catch(console.error);
