import type { ModuleConfig } from "../registry";
import DataPrivacyDpdpPage from "./DataPrivacyDpdpPage";

const config: ModuleConfig = {
  slug: "data_privacy_dpdp",
  title: "Data Privacy & DPDP Compliance",
  description:
    "Assurance over personal-data handling under DPDP/GDPR: data inventory, consent, retention, breach readiness and cross-border transfer controls.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: DataPrivacyDpdpPage,
};

export default config;
