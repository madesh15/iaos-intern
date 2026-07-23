import type { ModuleConfig } from "../registry";
import UtilitiesEnergyPage from "./UtilitiesEnergyPage";

const config: ModuleConfig = {
  slug: "utilities_energy",
  title: "Utilities & Energy",
  description: "Utilities & Energy — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: UtilitiesEnergyPage,
};

export default config;
