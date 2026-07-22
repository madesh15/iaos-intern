import type { ModuleConfig } from "../registry";
import FixedAssetsCwipPage from "./FixedAssetsCwipPage";

const config: ModuleConfig = {
  slug: "fixed_assets_cwip",
  title: "Fixed Assets & CWIP",
  description: "Fixed Assets & CWIP — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: FixedAssetsCwipPage,
};

export default config;
