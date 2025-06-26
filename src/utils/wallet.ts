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
