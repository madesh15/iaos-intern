import type { ModuleConfig } from "../registry";
import ItgcPage from "./ItgcPage";

const config: ModuleConfig = {
  slug: "itgc",
  title: "IT General Controls (ITGC)",
  description:
    "Tests foundational IT controls: change management, access, operations and backup/recovery.",
  icon: "server",
  group: "Technology & Resilience",
  component: ItgcPage,
};

export default config;
