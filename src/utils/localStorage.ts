
export interface DemandItem {
  id: string;
  department: string;
  item: string;
  subcategory: string;
  quantity: number;
  date: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  inchargeId: string;
}

export interface UsageRecord {
  id: string;
  demandId: string;
  patientId: string;
  itemUsed: string;
  quantity: number;
  timestamp: number;
  inchargeId: string;
}

// Store demands in localStorage
export const saveDemand = (demand: DemandItem): void => {
  const demands = getAllDemands();
  demands.push(demand);
  localStorage.setItem('hms_demands', JSON.stringify(demands));
};

// Get all demands from localStorage
export const getAllDemands = (): DemandItem[] => {
  const storedDemands = localStorage.getItem('hms_demands');
  return storedDemands ? JSON.parse(storedDemands) : [];
};

// Get demands by incharge ID
export const getDemandsByIncharge = (inchargeId: string): DemandItem[] => {
  const demands = getAllDemands();
  return demands.filter(demand => demand.inchargeId === inchargeId);
};

// Update demand status
export const updateDemandStatus = (demandId: string, status: 'approved' | 'rejected'): void => {
  const demands = getAllDemands();
  const updatedDemands = demands.map(demand => 
    demand.id === demandId ? { ...demand, status } : demand
  );
  localStorage.setItem('hms_demands', JSON.stringify(updatedDemands));
};

// Save usage record
export const saveUsageRecord = (record: UsageRecord): void => {
  const records = getAllUsageRecords();
  records.push(record);
  localStorage.setItem('hms_usage_records', JSON.stringify(records));
};

// Get all usage records
export const getAllUsageRecords = (): UsageRecord[] => {
  const storedRecords = localStorage.getItem('hms_usage_records');
  return storedRecords ? JSON.parse(storedRecords) : [];
};

// Get usage records by incharge ID
export const getUsageRecordsByIncharge = (inchargeId: string): UsageRecord[] => {
  const records = getAllUsageRecords();
  return records.filter(record => record.inchargeId === inchargeId);
};

// Calculate remaining stock for an item
export const getRemainingStock = (demandId: string): number => {
  const demands = getAllDemands();
  const records = getAllUsageRecords();
  
  const demand = demands.find(d => d.id === demandId);
  if (!demand) return 0;
  
  const usageRecords = records.filter(r => r.demandId === demandId);
  const totalUsed = usageRecords.reduce((sum, record) => sum + record.quantity, 0);
  
  return Math.max(0, demand.quantity - totalUsed);
};

// Clear all usage records for an incharge
export const clearUsageRecordsForIncharge = (inchargeId: string): void => {
  const allRecords = getAllUsageRecords();
  const filteredRecords = allRecords.filter(record => record.inchargeId !== inchargeId);
  localStorage.setItem('hms_usage_records', JSON.stringify(filteredRecords));
};

// Reset all data for the system (admin only)
export const resetAllData = (): void => {
  localStorage.removeItem('hms_demands');
  localStorage.removeItem('hms_usage_records');
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
