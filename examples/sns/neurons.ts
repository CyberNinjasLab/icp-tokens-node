import { createAgent } from "@dfinity/utils";
import { initSnsWrapper } from "@dfinity/sns";
import { AnonymousIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { Neuron } from "@dfinity/sns/dist/candid/sns_governance.js";

const getDissolvedNeurons = (neuron: Neuron, currentTime: number): boolean => {
  if (!neuron.dissolve_state) {
    console.warn("dissolve_state is undefined");
    return false;
  }

  return neuron.dissolve_state.some((state) => {
    if ("WhenDissolvedTimestampSeconds" in state) {
      return Number(state.WhenDissolvedTimestampSeconds) < currentTime;
    }
    if ("DissolveDelaySeconds" in state) {
      return Number(state.DissolveDelaySeconds) === 0;
    }
    console.warn("Unknown dissolve state:", state);
    return false;
  });
};

const extractNeuronId = (lastNeuron: Neuron): Uint8Array | number[] | undefined => {
  if (Array.isArray(lastNeuron.id) && lastNeuron.id.length > 0) {
    const neuronId = lastNeuron.id[0]; // Extract the first NeuronId
    if (neuronId?.id) {
      return neuronId.id instanceof Uint8Array
        ? neuronId.id
        : Array.isArray(neuronId.id)
        ? neuronId.id
        : undefined;
    } else {
      console.error("Neuron ID is undefined or invalid:", neuronId);
    }
  } else {
    console.error("Invalid or empty Neuron ID array:", lastNeuron.id);
  }
  return undefined;
};

const listNeuronsLite = async () => {
  try {
    // Initialize the agent with anonymous identity
    const agent = await createAgent({
      identity: new AnonymousIdentity(),
    });

    // Initialize the SNS wrapper
    const snsWrapper = await initSnsWrapper({
      rootOptions: {
        canisterId: Principal.fromText("rzbmc-yiaaa-aaaaq-aabsq-cai"),
      },
      agent,
      certified: false,
    });

    const { listNeurons } = snsWrapper;
    const allNeurons: Neuron[] = [];
    let beforeNeuronId: Uint8Array | number[] | undefined = undefined; // For pagination

    // Fetch neurons with pagination
    while (true) {
      const neurons: Neuron[] = await listNeurons({
        limit: 100,
        beforeNeuronId: beforeNeuronId ? { id: beforeNeuronId } : undefined,
      });

      // Add the neurons to the master list
      allNeurons.push(...neurons);

      // Exit if fewer than 100 neurons are returned (no more neurons to fetch)
      if (neurons.length < 100) break;

      // Update the ID for pagination using the last neuron
      beforeNeuronId = extractNeuronId(neurons[neurons.length - 1]);
      if (!beforeNeuronId) break;
    }

    console.log("Total Neurons Fetched:", allNeurons.length);

    let totalStake = 0;
    const dissolvedNeurons: Neuron[] = [];
    const notDissolvedNeurons: Neuron[] = [];

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    allNeurons.forEach((neuron) => {
      if (getDissolvedNeurons(neuron, currentTime)) {
        dissolvedNeurons.push(neuron);
      } else {
        notDissolvedNeurons.push(neuron);

        // Add stake if available
        if (neuron.cached_neuron_stake_e8s) {
          const realStake = Number(neuron.cached_neuron_stake_e8s) / 10 ** 8;
          totalStake += realStake;
        }
      }
    });

    // Log results
    console.log("Dissolved Neurons:", dissolvedNeurons.length);
    console.log("Not Dissolved Neurons:", notDissolvedNeurons.length);
    console.log("Locked:", totalStake);
  } catch (error) {
    console.error("An error occurred while listing neurons:", error);
  }
};

// Run the function
listNeuronsLite();
