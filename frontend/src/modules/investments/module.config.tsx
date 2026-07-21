import type { ModuleConfig } from "../registry";
import InvestmentsPage from "./InvestmentsPage";

const config: ModuleConfig = {
  slug: "investments",
  title: "Investments",
  description: "Investments — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: InvestmentsPage,
};

export default config;
