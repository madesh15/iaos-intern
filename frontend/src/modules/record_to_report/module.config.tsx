import type { ModuleConfig } from "../registry";
import R2RMainPage from "./pages/R2RMainPage";

const config: ModuleConfig = {
  slug: "record_to_report",
  title: "Record-to-Report & Journal Entries",
  description: "Analyse GL and Journal Entries to identify high-risk postings, period-end manipulation, reconciliation issues, and segregation of duties violations.",
  icon: "file-check",
  group: "Finance & Close",
  component: R2RMainPage,
};

export default config;
