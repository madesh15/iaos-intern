import type { ModuleConfig } from "../registry";
import ErpAccessIamPage from "./ErpAccessIamPage";

const config: ModuleConfig = {
  slug: "erp_access_iam",
  title: "ERP Access (IAM)",
  description: "ERP Access (IAM) — audit module.",
  icon: "server",
  group: "Technology & Resilience",
  component: ErpAccessIamPage,
};

export default config;
