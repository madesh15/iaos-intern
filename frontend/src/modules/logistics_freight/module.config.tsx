import type { ModuleConfig } from "../registry";
import Module from "./Module";

const config: ModuleConfig = {
  slug: "logistics_freight",
  title: "Logistics & Freight",
  description: "Controls freight and transport costs through freight rate validation, routing analytics, carrier performance, detention analysis, duplicate billing detection, POD reconciliation, SLA monitoring, and freight cost analytics.",
  icon: "truck",
  group: "Operations",
  component: Module,
};

export default config;
