import type { ModuleConfig } from "../registry";
import SalesDistributionPage from "./SalesDistributionPage";

const config: ModuleConfig = {
  slug: "sales_distribution",
  title: "Sales & Distribution",
  description: "Sales & Distribution — core assurance & operations audit module.",
  icon: "trending-up",
  group: "Operations",
  component: SalesDistributionPage,
};

export default config;
