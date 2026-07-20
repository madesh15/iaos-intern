import type { ModuleConfig } from "../registry";
import LabourCompliancePage from "./LabourCompliancePage";

const config: ModuleConfig = {
  slug: "labour_compliance",
  title: "Labour Law & PF/ESI Compliance",
  description:
    "Assurance over labour law obligations including Labour Acts, PF, ESI, " +
    "Minimum Wages, POSH, Bonus, Gratuity, Contract Labour, Working Hours, " +
    "Labour Welfare Fund, Wage Code, and Statutory Returns.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: LabourCompliancePage,
};

export default config;
