import { Token } from "@icptokens/token-toolkit";
import { HttpAgent } from "@dfinity/agent";

const agent = new HttpAgent({ host: "https://ic0.app" });

let tokenAdapter = new Token({
  canisterId: "iy6hh-xaaaa-aaaan-qauza-cai",
  agent
})

await tokenAdapter.init();

console.log(await tokenAdapter.name());

