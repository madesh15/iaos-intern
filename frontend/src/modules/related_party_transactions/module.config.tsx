import type { ModuleConfig } from "../registry";
import RelatedPartyTransactionsPage from "./RelatedPartyTransactionsPage";

const config: ModuleConfig = {
  slug: "related_party_transactions",
  title: "Related-Party Transactions",
  description: "Related-Party Transactions — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: RelatedPartyTransactionsPage,
};

export default config;
