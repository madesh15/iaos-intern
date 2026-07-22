import type { ModuleConfig } from "../registry";
import CybersecurityPage from "./CybersecurityPage";

const config: ModuleConfig = {
  slug: "cybersecurity",
  title: "Cybersecurity & Information Security",
  description:
    "Assesses the cyber-control posture: perimeter and endpoint security, vulnerability management, incident response and data-loss prevention.",
  icon: "shield",
  group: "Tax, Legal & Compliance",
  component: CybersecurityPage,
};

export default config;
