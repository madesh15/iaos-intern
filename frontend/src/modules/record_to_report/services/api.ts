import { get, post, put, del } from "../../../lib/api";
import type {
  JournalEntry,
  R2RException,
  Reconciliation,
  CloseTask,
  Finding,
  Workpaper,
  Action,
  Rule,
  AuditScope,
  DashboardData,
} from "../types";

const BASE = "/api/modules/record_to_report";

export const r2rApi = {
  dashboard: () => get<DashboardData>(`${BASE}/dashboard`),
  seed: () => post<any>(`${BASE}/seed`),

  journals: () => get<JournalEntry[]>(`${BASE}/journals`),
  createJournal: (data: any) => post<JournalEntry>(`${BASE}/journals`, data),
  updateJournal: (id: number, data: any) => put<JournalEntry>(`${BASE}/journals/${id}`, data),
  deleteJournal: (id: number) => del(`${BASE}/journals/${id}`),
  uploadJournals: (entries: any[]) => post<any>(`${BASE}/upload`, entries),
  runRiskAnalysis: () => post<any>(`${BASE}/risk-analysis`),

  exceptions: () => get<R2RException[]>(`${BASE}/exceptions`),
  createException: (data: any) => post<R2RException>(`${BASE}/exceptions`, data),
  updateException: (id: number, data: any) => put<R2RException>(`${BASE}/exceptions/${id}`, data),

  reconciliations: () => get<Reconciliation[]>(`${BASE}/reconciliations`),
  createReconciliation: (data: any) => post<Reconciliation>(`${BASE}/reconciliations`, data),
  updateReconciliation: (id: number, data: any) => put<Reconciliation>(`${BASE}/reconciliations/${id}`, data),

  closeTasks: () => get<CloseTask[]>(`${BASE}/close-tasks`),
  createCloseTask: (data: any) => post<CloseTask>(`${BASE}/close-tasks`, data),
  updateCloseTask: (id: number, data: any) => put<CloseTask>(`${BASE}/close-tasks/${id}`, data),

  findings: () => get<Finding[]>(`${BASE}/findings`),
  createFinding: (data: any) => post<Finding>(`${BASE}/findings`, data),
  updateFinding: (id: number, data: any) => put<Finding>(`${BASE}/findings/${id}`, data),

  workpapers: () => get<Workpaper[]>(`${BASE}/workpapers`),
  createWorkpaper: (data: any) => post<Workpaper>(`${BASE}/workpapers`, data),
  updateWorkpaper: (id: number, data: any) => put<Workpaper>(`${BASE}/workpapers/${id}`, data),

  actions: () => get<Action[]>(`${BASE}/actions`),
  createAction: (data: any) => post<Action>(`${BASE}/actions`, data),
  updateAction: (id: number, data: any) => put<Action>(`${BASE}/actions/${id}`, data),

  rules: () => get<Rule[]>(`${BASE}/rules`),
  createRule: (data: any) => post<Rule>(`${BASE}/rules`, data),
  updateRule: (id: number, data: any) => put<Rule>(`${BASE}/rules/${id}`, data),

  scopes: () => get<AuditScope[]>(`${BASE}/scopes`),
  createScope: (data: any) => post<AuditScope>(`${BASE}/scopes`, data),
  updateScope: (id: number, data: any) => put<AuditScope>(`${BASE}/scopes/${id}`, data),

  analytics: {
    manualRisk: () => get<any[]>(`${BASE}/analytics/manual-risk`),
    oddHour: () => get<any[]>(`${BASE}/analytics/odd-hour`),
    blankNarration: () => get<any[]>(`${BASE}/analytics/blank-narration`),
    sensitiveAccount: () => get<any[]>(`${BASE}/analytics/sensitive-account`),
    topValue: () => get<any[]>(`${BASE}/analytics/top-value`),
    suspenseAgeing: () => get<any[]>(`${BASE}/analytics/suspense-ageing`),
    postClose: () => get<any[]>(`${BASE}/analytics/post-close`),
    roundNumber: () => get<any[]>(`${BASE}/analytics/round-number`),
    sod: () => get<any[]>(`${BASE}/analytics/sod`),
    recurring: () => get<any[]>(`${BASE}/analytics/recurring`),
    reversal: () => get<any[]>(`${BASE}/analytics/reversal`),
    intercompany: () => get<any[]>(`${BASE}/analytics/intercompany`),
    closeCalendar: () => get<any[]>(`${BASE}/analytics/close-calendar`),
    reconciliation: () => get<any[]>(`${BASE}/analytics/reconciliation`),
    glSubledger: () => get<any[]>(`${BASE}/analytics/gl-subledger`),
    kpis: () => get<any>(`${BASE}/analytics/kpis`),
    scope: () => get<any[]>(`${BASE}/analytics/scope`),
    rcm: () => get<any[]>(`${BASE}/analytics/rcm`),
    rulesSummary: () => get<any[]>(`${BASE}/analytics/rules`),
    dataSources: () => get<any[]>(`${BASE}/analytics/data-sources`),
    sampling: () => get<any>(`${BASE}/analytics/sampling`),
    exceptionsSummary: () => get<any[]>(`${BASE}/analytics/exceptions`),
    workpapersSummary: () => get<any[]>(`${BASE}/analytics/workpapers`),
    observations: () => get<any[]>(`${BASE}/analytics/observations`),
    capa: () => get<any[]>(`${BASE}/analytics/capa`),
  },
};
