# Master Data Change Governance — Module Documentation

**Module slug:** `master_data_change_governance`
**Group:** Controls, Risk & Fraud
**Base URL:** `/api/modules/master_data_change_governance`

Cross-cutting oversight of critical master data with change control and integrity analytics.

---

## Authentication

All API calls require a valid JWT token in the `Authorization: Bearer <token>` header.
Login: `admin@test.com` / `Admin123!` (tenant_admin).

---

## 1. Dashboard & KPIs

**Endpoint:** `GET /dashboard/kpis`
**Frontend tab:** Dashboard & KPIs (Overview group)

Returns aggregated counts across the module:

| KPI Key | Description |
|---|---|
| `total_change_logs` | Total change log entries for the tenant |
| `active_workflows` | Number of active maker-checker rules |
| `open_exceptions` | Exceptions with status "Open" |
| `open_duplicates` | Duplicate pairs with status "open" |
| `reconciliation_match_rate` | Percentage of reconciliation records with status "match" |
| `open_findings` | Findings with status "Open" |
| `open_remediations` | Remediation items with status "Planned" or "In Progress" |

The dashboard also shows a risk-heatmap grid by master type and change type, and a recent-changes table.

---

## 2. Critical-Field Change Log

**Endpoints:**
- `GET /change-logs` — list all changes (optional `?master_type=` query param)
- `GET /change-logs/chart-of-accounts` — filtered to COA changes
- `GET /change-logs/cost-centres` — filtered to cost-centre changes
- `GET /change-logs/bank-masters` — filtered to bank-master changes
- `POST /change-logs` — create a new change log entry
- `DELETE /change-logs/{id}` — delete a change log entry

**Frontend tab:** Change Log (Change Tracking group) — includes a "Filter by Master Type" dropdown to switch between All / Chart of Accounts / Cost Centres / Bank Masters.

**Fields logged:** master_type, record_id, record_name, field_name, old_value, new_value, change_type (create/update/delete), change_user, approval_status, notes.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 3. Maker-Checker Enforcement

**Endpoints:**
- `GET /workflows` — list all workflow rules
- `POST /workflows` — create a new rule
- `DELETE /workflows/{id}` — delete a rule

**Frontend tab:** Maker-Checker (Governance Controls group)

Define which master type + field combinations require dual approval. Each rule specifies a master type, field name (or `*` for all), number of required approvers, and active/inactive status.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 4. After-Hours Changes

**Endpoint:** `GET /after-hours-changes`

**Frontend tab:** After-Hours Changes (Governance Controls group)

Read-only view of change log entries made outside business hours (before 8 AM or after 6 PM). Used for detecting unauthorized off-hours edits.

**UI features:** Search, CSV export.

---

## 5. Orphan / Unmapped Records

**Endpoint:** `GET /orphan-records`

**Frontend tab:** Orphan / Unmapped (Governance Controls group)

Read-only view of records that were created but never updated — potential orphan or unmapped entries. The backend scans the change log: records with a "create" but no subsequent "update" are flagged.

**UI features:** Search, CSV export.

---

## 6. Bulk-Upload Controls

**Endpoints:**
- `GET /bulk-uploads` — list all bulk upload logs
- `POST /bulk-uploads` — log a new bulk upload

**Frontend tab:** Bulk Uploads (Governance Controls group)

Track bulk-import runs: filename, master type, uploader, total/success/failure counts, status (completed/failed/pending), and notes. Provides an audit trail for data loads.

**UI features:** Search, CSV export.

---

## 7. Field-Level Access Review

**Endpoints:**
- `GET /field-access` — list all field access configs
- `POST /field-access` — create a new config
- `DELETE /field-access/{id}` — delete a config

**Frontend tab:** Field-Level Access (Governance Controls group)

Define per-field, per-role edit/view permissions on master data. Each config specifies master type, field name, role, and can_edit / can_view booleans.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 8. Data-Quality Scorecard

**Endpoints:**
- `GET /quality-scores` — list all quality scores
- `POST /quality-scores` — record a new score evaluation

**Frontend tab:** Quality Scorecard (Analytics & Quality group)

Record quality-dimension scores (completeness, accuracy, timeliness, uniqueness, validity, consistency) per master type. Each entry includes total records, passing records, calculated score %, and evaluation timestamp.

**UI features:** Search, CSV export.

---

## 9. Duplicate Detection Engine

**Endpoints:**
- `GET /duplicates` — list all duplicate pairs
- `POST /duplicates` — flag a new duplicate pair
- `PATCH /duplicates/{id}` — update status (open / confirmed / false_positive)
- `DELETE /duplicates/{id}` — delete a pair

**Frontend tab:** Duplicate Detection (Analytics & Quality group)

Log potential duplicate record pairs with match score %. Investigators can update status to "Confirmed" or "False Positive" inline via dropdown.

**UI features:** Search, multi-select, CSV export, inline status update.

---

## 10. Reference-Data Consistency

**Endpoints:**
- `GET /reference-data` — list all reference data entries
- `POST /reference-data` — add an entry

**Frontend tab:** Reference Consistency (Analytics & Quality group)

Track cross-module code/reference-data alignment. Each entry records a code system, code value, two modules being compared, and whether they are consistent.

**UI features:** Search, multi-select, CSV export.

---

## 11. Change-Approval Ageing

**Endpoint:** `GET /approval-ageing`

**Frontend tab:** Approval Ageing (Analytics & Quality group)

Read-only view of change log entries with status "pending" approval, sorted oldest first. Each row shows how many days the approval has been open, colour-coded: green (0-3 days), gold (4-7 days), red (8+ days).

**UI features:** Search, CSV export.

---

## 12. Master Reconciliation

**Endpoints:**
- `GET /reconciliation` — list all reconciliation records
- `POST /reconciliation` — log a new reconciliation comparison

**Frontend tab:** Reconciliation (Analytics & Quality group)

Log source-to-target hash comparisons for master records. Each entry specifies source system, target system, hash values, and status (pending / match / mismatch).

**UI features:** Search, multi-select, CSV export.

---

## 13. Sensitive-Change Alerting

**Endpoints:**
- `GET /alerts` — list all alert rules
- `POST /alerts` — create a new alert rule
- `POST /alerts/{id}/trigger` — manually trigger an alert

**Frontend tab:** Change Alerting (Analytics & Quality group)

Configure threshold-based alerts: when N or more changes occur to a specific master type + field, notify the listed recipients. Each rule has a message template and can be triggered manually.

**UI features:** Search, multi-select, CSV export, manual trigger button.

---

## 14. Scope & Audit Universe

**Endpoints:**
- `GET /scope` — list all scope items
- `POST /scope` — add an entity
- `DELETE /scope/{id}` — remove an entity

**Frontend tab:** Audit Universe (Audit Framework group)

Define entities in scope: type (GL, Cost Centre, Profit Centre, Bank, Vendor, Customer, Other), name, description, and risk rating (High / Medium / Low).

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 15. Risk & Control Matrix (RCM)

**Endpoints:**
- `GET /rcm` — list all RCM entries
- `POST /rcm` — add a mapping
- `DELETE /rcm/{id}` — remove a mapping

**Frontend tab:** Risk & Controls (Audit Framework group)

Map risks to controls: risk ID + description, control ID + description, control type (Preventive / Detective / Corrective), control owner, frequency (Daily through Annually), and assertion.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 16. Test & Analytics Rule Library

**Endpoints:**
- `GET /rules` — list all rules
- `POST /rules` — add a rule
- `DELETE /rules/{id}` — delete a rule

**Frontend tab:** Test Rule Library (Audit Framework group)

Register reusable audit analytics rules: name, type (Red-Flag / Threshold / Anomaly / Compliance), master type, threshold, CAAT script description, and active status.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 17. Data Source & Connector Setup

**Endpoints:**
- `GET /data-sources` — list all data sources
- `POST /data-sources` — add a source
- `DELETE /data-sources/{id}` — remove a source

**Frontend tab:** Data Sources (Audit Framework group)

Document external data connectors: source name, type (ERP / API / CSV Upload / Database / Manual), connection detail, table mapping, and active status.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 18. Sampling & Population Builder

**Endpoints:**
- `GET /sampling` — list all sampling records
- `POST /sampling` — create a sample
- `DELETE /sampling/{id}` — delete a record

**Frontend tab:** Sampling (Audit Framework group)

Define audit sample populations: population name, population size, sample size, method (Random / Stratified / Systematic / Judgemental), and notes.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 19. Exception & Red-Flag Queue

**Endpoints:**
- `GET /exceptions` — list all exceptions
- `POST /exceptions` — add an exception
- `PATCH /exceptions/{id}` — update status (Open / In Progress / Closed)
- `DELETE /exceptions/{id}` — delete an exception

**Frontend tab:** Exceptions (Audit Framework group)

Log and track exceptions/red-flags: type, description, severity (High / Medium / Low), status, assigned-to, and notes. Status is updated inline via dropdown.

**UI features:** Search, multi-select + bulk delete, CSV export, inline status update.

---

## 20. Working Papers & Evidence

**Endpoints:**
- `GET /working-papers` — list all papers
- `POST /working-papers` — add a paper
- `DELETE /working-papers/{id}` — delete a paper

**Frontend tab:** Working Papers (Audit Framework group)

Attach working papers and evidence to the audit: title, type (Evidence / Memo / Checklist / Analysis / Screenshot), description, reference URL, and status.

**UI features:** Search, multi-select + bulk delete, CSV export.

---

## 21. Observation & Finding Log

**Endpoints:**
- `GET /findings` — list all findings
- `POST /findings` — add a finding
- `PATCH /findings/{id}` — update status (Open / In Progress / Closed)
- `DELETE /findings/{id}` — delete a finding

**Frontend tab:** Findings (Audit Framework group)

Record audit observations and findings: title, description, severity (High / Medium / Low), status, assigned-to, and notes. Status is updated inline via dropdown.

**UI features:** Search, multi-select + bulk delete, CSV export, inline status update.

---

## 22. Remediation / Action Tracker

**Endpoints:**
- `GET /remediation` — list all items
- `POST /remediation` — add an action
- `PATCH /remediation/{id}` — update status (Planned / In Progress / Completed)
- `DELETE /remediation/{id}` — delete an item

**Frontend tab:** Remediation (Audit Framework group)

Track remediation tasks: action title, description, owner, status, and notes. Status is updated inline via dropdown.

**UI features:** Search, multi-select + bulk delete, CSV export, inline status update.

---

## Shared UI Components

### TableToolbar
Every table section includes:
- **Search input** — real-time text filtering across all columns
- **Bulk select** — header checkbox selects/deselects all visible rows
- **Bulk delete** — appears when rows are selected; deletes all selected rows
- **Export CSV** — downloads filtered rows as a CSV file

### SavedBanner
A green "Saved successfully." alert that auto-dismisses after 2 seconds on every form submit.

### Hover Tooltips
All sidebar nav items and key interactive buttons have `title` attributes for contextual help on hover.

---

## Database Tables (all prefixed `mod_mdcg_`)

| Table | Model | Description |
|---|---|---|
| `mod_mdcg_change_logs` | MasterDataChangeLog | Critical-field change audit trail |
| `mod_mdcg_workflows` | MakerCheckerWorkflow | Maker-checker approval rules |
| `mod_mdcg_bulk_uploads` | BulkUploadLog | Bulk import audit trail |
| `mod_mdcg_field_access` | FieldAccessConfig | Per-field role permissions |
| `mod_mdcg_quality_scores` | DataQualityScore | Quality dimension evaluations |
| `mod_mdcg_duplicates` | DuplicatePair | Potential duplicate pairs |
| `mod_mdcg_reference_data` | ReferenceDataCode | Cross-module code consistency |
| `mod_mdcg_reconciliation` | ReconciliationResult | Source-to-target comparisons |
| `mod_mdcg_alerts` | SensitiveChangeAlert | Threshold-based alert rules |
| `mod_mdcg_scope` | AuditScopeItem | Audit scope universe |
| `mod_mdcg_rcm` | RcmEntry | Risk-control matrix |
| `mod_mdcg_rules` | TestRule | Analytics/test rule library |
| `mod_mdcg_data_sources` | DataSourceConfig | External data connectors |
| `mod_mdcg_sampling` | SamplingRecord | Audit sample populations |
| `mod_mdcg_exceptions` | ExceptionItem | Red-flag exception queue |
| `mod_mdcg_working_papers` | WorkingPaper | Audit evidence & memos |
| `mod_mdcg_findings` | AuditFinding | Observation & finding log |
| `mod_mdcg_remediation` | RemediationItem | Action/remediation tracker |

All tables include a `tenant_id` column for multi-tenant isolation.
