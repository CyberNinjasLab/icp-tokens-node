export interface SnsAggregatorResponse {
  index: number;
  canister_ids: CanisterIds;
  list_sns_canisters: ListSnsCanisters;
  meta: Meta;
  parameters: Parameters;
  nervous_system_parameters: NervousSystemParameters;
  swap_state: SwapState;
  icrc1_metadata: Icrc1Metadata[];
  icrc1_fee: number[];
  icrc1_total_supply: number;
  swap_params: SwapParams;
  init: Init;
  derived_state: DerivedState;
  lifecycle: Lifecycle;
}

export interface CanisterIds {
  root_canister_id: string;
  governance_canister_id: string;
  index_canister_id: string;
  swap_canister_id: string;
  ledger_canister_id: string;
}

export interface ListSnsCanisters {
  root: string;
  swap: string;
  ledger: string;
  index: string;
  governance: string;
  dapps: string[];
  archives: string[];
}

export interface Meta {
  url: string;
  name: string;
  description: string;
  logo: string;
}

export interface Parameters {
  reserved_ids: any[];
  functions: NervousSystemFunction[];
}

export interface NervousSystemFunction {
  id: number;
  name: string;
  description: string;
  function_type: FunctionType;
}

export interface FunctionType {
  NativeNervousSystemFunction?: Record<string, never>;
  GenericNervousSystemFunction?: GenericNervousSystemFunction;
}

export interface GenericNervousSystemFunction {
  validator_canister_id: string;
  target_canister_id: string;
  validator_method_name: string;
  target_method_name: string;
}

export interface NervousSystemParameters {
  default_followees: { followees: any[] };
  max_dissolve_delay_seconds: number;
  max_dissolve_delay_bonus_percentage: number;
  max_followees_per_function: number;
  neuron_claimer_permissions: { permissions: number[] };
  neuron_minimum_stake_e8s: number;
  max_neuron_age_for_age_bonus: number;
  initial_voting_period_seconds: number;
  neuron_minimum_dissolve_delay_to_vote_seconds: number;
  reject_cost_e8s: number;
  max_proposals_to_keep_per_action: number;
  wait_for_quiet_deadline_increase_seconds: number;
  max_number_of_neurons: number;
  transaction_fee_e8s: number;
  max_number_of_proposals_with_ballots: number;
  max_age_bonus_percentage: number;
  neuron_grantable_permissions: { permissions: number[] };
  voting_rewards_parameters: VotingRewardsParameters;
  maturity_modulation_disabled: boolean;
  max_number_of_principals_per_neuron: number;
}

export interface VotingRewardsParameters {
  final_reward_rate_basis_points: number;
  initial_reward_rate_basis_points: number;
  reward_rate_transition_duration_seconds: number;
  round_duration_seconds: number;
}

export interface SwapState {
  swap: SwapDetails;
  derived: Derived;
}

export interface SwapDetails {
  lifecycle: number;
  init: SwapInit;
  params: SwapParamsDetails;
  open_sns_token_swap_proposal_id: number;
  decentralization_sale_open_timestamp_seconds: number;
}

export interface SwapInit {
  nns_proposal_id: number;
  sns_root_canister_id: string;
  neurons_fund_participation: boolean;
  min_participant_icp_e8s: number;
  neuron_basket_construction_parameters: NeuronBasketConstructionParameters;
  fallback_controller_principal_ids: string[];
  max_icp_e8s: number | null;
  neuron_minimum_stake_e8s: number;
  confirmation_text: string | null;
  swap_start_timestamp_seconds: number;
  swap_due_timestamp_seconds: number;
  min_participants: number;
  sns_token_e8s: number;
  nns_governance_canister_id: string;
  transaction_fee_e8s: number;
  icp_ledger_canister_id: string;
  sns_ledger_canister_id: string;
  neurons_fund_participation_constraints: NeuronsFundParticipationConstraints;
  neurons_fund_participants: any;
  should_auto_finalize: boolean;
  max_participant_icp_e8s: number;
  sns_governance_canister_id: string;
  min_direct_participation_icp_e8s: number;
  restricted_countries: RestrictedCountries;
  min_icp_e8s: number | null;
  max_direct_participation_icp_e8s: number;
}

export interface NeuronBasketConstructionParameters {
  dissolve_delay_interval_seconds: number;
  count: number;
}

export interface NeuronsFundParticipationConstraints {
  coefficient_intervals: CoefficientInterval[];
}

export interface CoefficientInterval {
  slope_numerator: number;
  intercept_icp_e8s: number;
  from_direct_participation_icp_e8s: number;
  slope_denominator: number;
  to_direct_participation_icp_e8s: number;
}

export interface RestrictedCountries {
  iso_codes: string[];
}

export interface SwapParamsDetails {
  min_participant_icp_e8s: number;
  neuron_basket_construction_parameters: NeuronBasketConstructionParameters;
  max_icp_e8s: number;
  swap_due_timestamp_seconds: number;
  min_participants: number;
  sns_token_e8s: number;
  sale_delay_seconds: number | null;
  max_participant_icp_e8s: number;
  min_direct_participation_icp_e8s: number;
  min_icp_e8s: number;
  max_direct_participation_icp_e8s: number;
}

export interface Derived {
  buyer_total_icp_e8s: number;
  sns_tokens_per_icp: number;
}

export interface DerivedState {
  sns_tokens_per_icp: number;
  buyer_total_icp_e8s: number;
  cf_participant_count: number;
  neurons_fund_participation_icp_e8s: number;
  direct_participation_icp_e8s: number;
  direct_participant_count: number;
  cf_neuron_count: number;
}

export interface Icrc1Metadata {
  [key: string]: { Text?: string; Nat?: number[] };
}

export interface SwapParams {
  params: SwapParamsDetails;
}

export interface Init {
  init: SwapInit;
}

export interface Lifecycle {
  decentralization_sale_open_timestamp_seconds: number;
  lifecycle: number;
  decentralization_swap_termination_timestamp_seconds: number;
}

// Add this new interface for commonly accessed properties
export interface SimplifiedSnsInfo {
  ledgerCanisterId: string;
  governanceCanisterId: string;
  description: string;
  url: string;
}
