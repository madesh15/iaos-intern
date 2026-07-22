import type { ModuleConfig } from "../registry";
import ItemMaterialMasterPage from "./ItemMaterialMasterPage";

const config: ModuleConfig = {
  slug: "item_material_master_governance",
  title: "Item & Material Master Governance",
  description: "Audit & governance for item master data — duplicates, HSN, valuation, UOM, BOM, naming, dead stock, and more.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: ItemMaterialMasterPage,
};

export default config;
