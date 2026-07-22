import type { ModuleConfig } from "../registry";
import VendorMasterManagementPage from "./pages/VendorMasterManagementPage";

const config: ModuleConfig = {
  slug: "vendor_master_management",
  title: "Vendor Master & Management",
  description: "Governs vendor master data and identifies audit risks including duplicates, ghost vendors, KYC gaps, concentration risk, and more.",
  icon: "cart",
  group: "Procurement & Spend",
  component: VendorMasterManagementPage,
};

export default config;
