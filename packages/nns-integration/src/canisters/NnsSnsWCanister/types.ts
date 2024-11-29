import { Principal } from '@dfinity/principal';

// Define the structure of a single SNS instance
export interface SnsInstance {
  root_canister_id: Principal[];
  governance_canister_id: Principal[];
  index_canister_id: Principal[];
  swap_canister_id: Principal[];
  ledger_canister_id: Principal[];
}

// Define the structure of the response from `list_deployed_snses`
export interface SnsListResponse {
  instances: SnsInstance[];
}
