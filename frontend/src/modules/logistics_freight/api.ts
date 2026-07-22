import { api, get, post, put, del } from "../../lib/api";

const SLUG = "logistics_freight";
const BASE = `/api/modules/${SLUG}`;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function listShipments(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/shipments?${qs}`);
}

export function getShipment(id: number) {
  return get<any>(`${BASE}/shipments/${id}`);
}

export function createShipment(data: any) {
  return post<any>(`${BASE}/shipments`, data);
}

export function updateShipment(id: number, data: any) {
  return put<any>(`${BASE}/shipments/${id}`, data);
}

export function deleteShipment(id: number) {
  return del(`${BASE}/shipments/${id}`);
}

export function listCarriers(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/carriers?${qs}`);
}

export function getCarrier(id: number) {
  return get<any>(`${BASE}/carriers/${id}`);
}

export function createCarrier(data: any) {
  return post<any>(`${BASE}/carriers`, data);
}

export function updateCarrier(id: number, data: any) {
  return put<any>(`${BASE}/carriers/${id}`, data);
}

export function deleteCarrier(id: number) {
  return del(`${BASE}/carriers/${id}`);
}

export function listContracts(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/contracts?${qs}`);
}

export function createContract(data: any) {
  return post<any>(`${BASE}/contracts`, data);
}

export function updateContract(id: number, data: any) {
  return put<any>(`${BASE}/contracts/${id}`, data);
}

export function deleteContract(id: number) {
  return del(`${BASE}/contracts/${id}`);
}

export function listInvoices(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/invoices?${qs}`);
}

export function createInvoice(data: any) {
  return post<any>(`${BASE}/invoices`, data);
}

export function updateInvoice(id: number, data: any) {
  return put<any>(`${BASE}/invoices/${id}`, data);
}

export function deleteInvoice(id: number) {
  return del(`${BASE}/invoices/${id}`);
}

export function listRoutes(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/routes?${qs}`);
}

export function createRoute(data: any) {
  return post<any>(`${BASE}/routes`, data);
}

export function updateRoute(id: number, data: any) {
  return put<any>(`${BASE}/routes/${id}`, data);
}

export function deleteRoute(id: number) {
  return del(`${BASE}/routes/${id}`);
}

export function listPODs(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/pods?${qs}`);
}

export function createPOD(data: any) {
  return post<any>(`${BASE}/pods`, data);
}

export function updatePOD(id: number, data: any) {
  return put<any>(`${BASE}/pods/${id}`, data);
}

export function deletePOD(id: number) {
  return del(`${BASE}/pods/${id}`);
}

export function listClaims(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/claims?${qs}`);
}

export function createClaim(data: any) {
  return post<any>(`${BASE}/claims`, data);
}

export function updateClaim(id: number, data: any) {
  return put<any>(`${BASE}/claims/${id}`, data);
}

export function deleteClaim(id: number) {
  return del(`${BASE}/claims/${id}`);
}

export function listFindings(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/findings?${qs}`);
}

export function createFinding(data: any) {
  return post<any>(`${BASE}/findings`, data);
}

export function updateFinding(id: number, data: any) {
  return put<any>(`${BASE}/findings/${id}`, data);
}

export function deleteFinding(id: number) {
  return del(`${BASE}/findings/${id}`);
}

export function listActions(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/actions?${qs}`);
}

export function createAction(data: any) {
  return post<any>(`${BASE}/actions`, data);
}

export function updateAction(id: number, data: any) {
  return put<any>(`${BASE}/actions/${id}`, data);
}

export function deleteAction(id: number) {
  return del(`${BASE}/actions/${id}`);
}

export function listPlants(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/plants?${qs}`);
}

export function createPlant(data: any) {
  return post<any>(`${BASE}/plants`, data);
}

export function updatePlant(id: number, data: any) {
  return put<any>(`${BASE}/plants/${id}`, data);
}

export function deletePlant(id: number) {
  return del(`${BASE}/plants/${id}`);
}

export function listWarehouses(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/warehouses?${qs}`);
}

export function createWarehouse(data: any) {
  return post<any>(`${BASE}/warehouses`, data);
}

export function updateWarehouse(id: number, data: any) {
  return put<any>(`${BASE}/warehouses/${id}`, data);
}

export function deleteWarehouse(id: number) {
  return del(`${BASE}/warehouses/${id}`);
}

export function listRegions(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/regions?${qs}`);
}

export function createRegion(data: any) {
  return post<any>(`${BASE}/regions`, data);
}

export function updateRegion(id: number, data: any) {
  return put<any>(`${BASE}/regions/${id}`, data);
}

export function deleteRegion(id: number) {
  return del(`${BASE}/regions/${id}`);
}

export function listBusinessUnits(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/business-units?${qs}`);
}

export function createBusinessUnit(data: any) {
  return post<any>(`${BASE}/business-units`, data);
}

export function updateBusinessUnit(id: number, data: any) {
  return put<any>(`${BASE}/business-units/${id}`, data);
}

export function deleteBusinessUnit(id: number) {
  return del(`${BASE}/business-units/${id}`);
}

export function listRiskControls(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/risk-controls?${qs}`);
}

export function createRiskControl(data: any) {
  return post<any>(`${BASE}/risk-controls`, data);
}

export function updateRiskControl(id: number, data: any) {
  return put<any>(`${BASE}/risk-controls/${id}`, data);
}

export function deleteRiskControl(id: number) {
  return del(`${BASE}/risk-controls/${id}`);
}

export function listTestRules(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/test-rules?${qs}`);
}

export function createTestRule(data: any) {
  return post<any>(`${BASE}/test-rules`, data);
}

export function updateTestRule(id: number, data: any) {
  return put<any>(`${BASE}/test-rules/${id}`, data);
}

export function deleteTestRule(id: number) {
  return del(`${BASE}/test-rules/${id}`);
}

export function listDataSources(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/data-sources?${qs}`);
}

export function createDataSource(data: any) {
  return post<any>(`${BASE}/data-sources`, data);
}

export function updateDataSource(id: number, data: any) {
  return put<any>(`${BASE}/data-sources/${id}`, data);
}

export function deleteDataSource(id: number) {
  return del(`${BASE}/data-sources/${id}`);
}

export function listSampling(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/sampling?${qs}`);
}

export function createSamplingRecord(data: any) {
  return post<any>(`${BASE}/sampling`, data);
}

export function updateSamplingRecord(id: number, data: any) {
  return put<any>(`${BASE}/sampling/${id}`, data);
}

export function deleteSamplingRecord(id: number) {
  return del(`${BASE}/sampling/${id}`);
}

export function generateSample(data: any) {
  return post<any>(`${BASE}/sampling/generate`, data);
}

export function listExceptions(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/exceptions?${qs}`);
}

export function createException(data: any) {
  return post<any>(`${BASE}/exceptions`, data);
}

export function updateException(id: number, data: any) {
  return put<any>(`${BASE}/exceptions/${id}`, data);
}

export function deleteException(id: number) {
  return del(`${BASE}/exceptions/${id}`);
}

export function listWorkingPapers(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return get<PaginatedResult<any>>(`${BASE}/working-papers?${qs}`);
}

export function createWorkingPaper(data: any) {
  return post<any>(`${BASE}/working-papers`, data);
}

export function updateWorkingPaper(id: number, data: any) {
  return put<any>(`${BASE}/working-papers/${id}`, data);
}

export function deleteWorkingPaper(id: number) {
  return del(`${BASE}/working-papers/${id}`);
}

export function getDashboard() {
  return get<any>(`${BASE}/dashboard`);
}

export function getDashboardTrends() {
  return get<any>(`${BASE}/dashboard/trends`);
}

export function getAnalytics(endpoint: string) {
  return get<any>(`${BASE}/analytics/${endpoint}`);
}

export function exportCSV(entity: string) {
  window.open(`${BASE}/export/${entity}/csv`, "_blank");
}

export function exportXLSX(entity: string) {
  window.open(`${BASE}/export/${entity}/xlsx`, "_blank");
}

export function seedData() {
  return post<any>(`${BASE}/seed`, {});
}
