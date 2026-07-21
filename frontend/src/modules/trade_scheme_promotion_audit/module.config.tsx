import type { ModuleConfig } from "../registry";
import TradeSchemePromotionPage from "./TradeSchemePromotionPage";

const config: ModuleConfig = {
  slug: "trade_scheme_promotion_audit",
  title: "Trade Scheme & Promotion Audit",
  description: "Assurance over trade-spend and promotions — validating scheme design, claim settlement and ROI across channels.",
  icon: "cart",
  group: "Industry Packs",
  industry: "Retail / FMCG",
  component: TradeSchemePromotionPage,
};

export default config;
