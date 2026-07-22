import type { ModuleConfig } from "../registry";
import InsuranceCoverageClaimsPage from "./InsuranceCoverageClaimsPage";

const config: ModuleConfig = {
  slug: "insurance_coverage_claims",
  title: "Insurance Coverage & Claims",
  description:
    "Policy register, coverage adequacy and claims tracking from lodgement to recovery.",
  icon: "shield",
  group: "Treasury, Assets & Capital",
  component: InsuranceCoverageClaimsPage,
};

export default config;
