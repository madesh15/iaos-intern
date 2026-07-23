import type { ModuleConfig } from "../registry";
import BusinessContinuityDrPage from "./BusinessContinuityDrPage";

const config: ModuleConfig = {
  slug: "business_continuity_dr",
  title: "Business Continuity & DR",
  description: "Business Continuity & DR — audit module.",
  icon: "server",
  group: "Technology & Resilience",
  component: BusinessContinuityDrPage,
};

export default config;
