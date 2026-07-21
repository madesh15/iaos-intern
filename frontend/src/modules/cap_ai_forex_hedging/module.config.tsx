import type { ModuleConfig } from "../registry";
import CapAiForexHedgingPage from "./CapAiForexHedgingPage";

/**
 * Module manifest. Copy this whole folder to start your module:
 *   cp -r src/modules/_template src/modules/<your-slug>
 * Then set `slug` to match your BACKEND module folder name exactly.
 */
const config: ModuleConfig = {
  slug: "cap_ai_forex_hedging",
  title: "CAP-AI Forex & Hedging",
  description: "Enterprise-grade AI-powered Forex exposure and hedging management audit system.",
  icon: "trending-up",
  group: "Finance Cycles", // navigation group (see GROUPS in registry.ts)
  component: CapAiForexHedgingPage,
};

export default config;
