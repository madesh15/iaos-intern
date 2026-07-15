import type { ModuleConfig } from "../registry";
import BudgetingVariancePage from "./BudgetingVariancePage";

const config: ModuleConfig = {
  slug: "budgeting_variance",
  title: "Budgeting & Variance",
  description: "Budgeting & Variance — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: BudgetingVariancePage,
};

export default config;
