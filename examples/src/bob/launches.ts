import { HttpAgent } from "@dfinity/agent";
import { BobFunBaseService, OrderBy } from "@icptokens/bob-integration";

const bob = new BobFunBaseService();
const order : OrderBy = {
  CreatedAt : null
};

const result = await bob.getTokens(order);

console.log(result);
