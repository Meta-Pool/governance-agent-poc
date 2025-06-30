import {
  WalletSelector,
  setupWalletSelector,
} from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import {
  setupModal,
  WalletSelectorModal,
} from "@near-wallet-selector/modal-ui";

let selector: WalletSelector | null = null;
let modal: WalletSelectorModal | null = null;

export const initWalletSelector = async () => {
  if (!selector) {
    selector = await setupWalletSelector({
      network: "testnet",
      modules: [setupMyNearWallet()],
    });

    modal = setupModal(selector, {
      contractId: "vote.r-1748895584.testnet",
      methodNames: ["vote"],
      theme: "dark",
    });
  }

  return selector;
};

export const showWalletModal = () => {
  modal?.show();
};

/**
 * Gets the active account ID from the wallet selector state.
 * @returns {Promise<string | null>} The account ID of the signed-in user or null if not signed in.
 */
export const getActiveAccountId = async (): Promise<string | null> => {
  const selector = await initWalletSelector();
  const state = selector.store.getState();
  const account = state.accounts[0];

  return account?.accountId || null;
};
