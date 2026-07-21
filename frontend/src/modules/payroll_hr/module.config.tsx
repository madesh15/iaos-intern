import type { ModuleConfig } from "../registry";
import PayrollHrPage from "./PayrollHrPage";

const config: ModuleConfig = {
  slug: "payroll_hr",
  title: "Payroll & HR Audit",
  description:
    "Ghost-employee, overtime, and statutory-deduction red-flag testing plus full " +
    "scope-to-remediation audit workflow for the payroll & HR cycle.",
  icon: "wallet",
  group: "Finance & Close",
  component: PayrollHrPage,
};

export default config;
