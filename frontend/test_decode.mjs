import { rpc, Contract, nativeToScVal, Address, xdr, Networks } from "@stellar/stellar-sdk";

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org", { allowHttp: true });
const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "CDNK66APDPFR4IG5DNNV2RJBZEXNMVRYGU7XKZCFV5TU7AFUPZVLBS7Y";

async function main() {
  const contract = new Contract(contractId);
  const seller = "GD5QVXWGR3Y5O27UBCQQZYNAKNIHMYT55Y4QJ3E6U3Z7QOYR4GZBA5H";
  
  const args = [new Address(seller).toScVal()];
  const call = contract.call("get_seller_deals", ...args);
  
  // Use a completely random account ID just for simulation simulation 
  const tx = new rpc.TransactionBuilder(await rpcServer.getAccount("GABWUKW7P5K7M6IKS47YY73T46TCR5OOGCHZ4LZNRMWX77HOHYQOWDDO"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  }).addOperation(call).setTimeout(30).build();

  console.log("simulating...");
  const sim = await rpcServer.simulateTransaction(tx);
  console.log(sim);
  if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
    const val = sim.result.retval;
    console.log("XDR BASE64:", val.toXDR("base64"));
  } else {
    console.log("Simulation failed");
  }
}
main();
