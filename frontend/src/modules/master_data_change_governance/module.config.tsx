import type { ModuleConfig } from "../registry";
import MasterDataChangeGovernancePage from "./MasterDataChangeGovernancePage";

const config: ModuleConfig = {
  slug: "master_data_change_governance",
  title: "Master Data Change Governance",
  description: "Master Data Change Governance — audit module.",
  icon: "server",
  group: "Technology & Resilience",
  component: MasterDataChangeGovernancePage,
};

export default config;
