import type { ModuleConfig } from "../registry";
import WhistleblowerGrievancePage from "./WhistleblowerGrievancePage";

const config: ModuleConfig = {
  slug: "whistleblower_grievance",
  title: "Whistleblower & Grievance",
  description:
    "Confidential ethics-and-grievance channel with intake, triage, investigation, protection and closure.",
  icon: "shield",
  group: "Tax, Legal & Compliance",
  component: WhistleblowerGrievancePage,
};

export default config;
