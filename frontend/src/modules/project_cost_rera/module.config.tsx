import type { ModuleConfig } from "../registry";
import ProjectCostReraPage from "./ProjectCostReraPage";

const config: ModuleConfig = {
  slug: "project_cost_rera",
  title: "Project Cost & RERA Compliance",
  description: "RERA escrow discipline, project-cost control, revenue recognition and buyer-fund governance for real-estate projects.",
  icon: "building",
  group: "Industry Packs",
  industry: "Real Estate",
  component: ProjectCostReraPage,
};

export default config;
