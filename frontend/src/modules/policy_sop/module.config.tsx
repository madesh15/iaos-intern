import type { ModuleConfig } from "../registry";
import PolicySopPage from "./PolicySopPage";

const config: ModuleConfig = {
  slug: "policy_sop",
  title: "Policy & SOP",
  description: "Policy & SOP — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: PolicySopPage,
};

export default config;
