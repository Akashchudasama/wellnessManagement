
import { useState, useEffect } from "react";
import { DemandItem, UsageRecord, getAllDemands, getAllUsageRecords, updateDemandStatus } from "@/utils/localStorage";
import { Download, Filter, Search, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface RecordsTableProps {
  type: "demands" | "usage";
  onDataChange?: () => void;
  statusFilter?: string;
}

const RecordsTable = ({ type, onDataChange, statusFilter = "" }: RecordsTableProps) => {
  const [records, setRecords] = useState<DemandItem[] | UsageRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DemandItem[] | UsageRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    if (type === "demands") {
      const demands = getAllDemands();
      setRecords(demands);
      setFilteredRecords(demands);
    } else {
      const usageRecords = getAllUsageRecords();
      setRecords(usageRecords);
      setFilteredRecords(usageRecords);
    }
  }, [type]);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, filterValue, records, statusFilter]);

  const filterRecords = () => {
    // We need to ensure types are consistent
    if (type === "demands") {
      // When working with demands, we know records is DemandItem[]
      const demandsRecords = records as DemandItem[];
      let filtered = [...demandsRecords];
      
      // Apply status filter from parent component first
      if (statusFilter) {
        filtered = filtered.filter(item => item.status === statusFilter);
      }
      
      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          item => 
            item.department.toLowerCase().includes(term) ||
            item.item.toLowerCase().includes(term) ||
            item.subcategory.toLowerCase().includes(term)
        );
      }
      
      // Apply department filter
      if (filterValue) {
        filtered = filtered.filter(item => item.department === filterValue);
      }
      
      setFilteredRecords(filtered);
    } else {
      // When working with usage, we know records is UsageRecord[]
      const usageRecords = records as UsageRecord[];
      let filtered = [...usageRecords];
      
      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          item => 
            item.patientId.toLowerCase().includes(term) ||
            item.itemUsed.toLowerCase().includes(term)
        );
      }
      
      // Apply filter for usage records
      if (filterValue) {
        // For usage records, we'd need the corresponding demand to get the department
        const demands = getAllDemands();
        filtered = filtered.filter(item => {
          const matchingDemand = demands.find(d => d.id === item.demandId);
          return matchingDemand && matchingDemand.department === filterValue;
        });
      }
      
      setFilteredRecords(filtered);
    }
  };

  const handleStatusChange = (demandId: string, newStatus: 'approved' | 'rejected') => {
    try {
      updateDemandStatus(demandId, newStatus);
      
      // Update local state
      if (type === "demands") {
        const updatedRecords = (records as DemandItem[]).map(record => 
          record.id === demandId ? { ...record, status: newStatus } : record
        );
        setRecords(updatedRecords);
        
        // Show success toast
        toast(`Demand ${newStatus}`, {
          description: `The demand has been ${newStatus} successfully.`,
          icon: newStatus === 'approved' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />,
        });
        
        // Call the callback function if provided
        if (onDataChange) {
          onDataChange();
        }
      }
    } catch (error) {
      console.error(`Error ${newStatus} demand:`, error);
      toast(`Failed to ${newStatus} demand`, {
        description: "An error occurred. Please try again.",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const exportToCSV = () => {
    let csvContent = "";
    
    // Create headers
    if (type === "demands") {
      csvContent = "ID,Department,Item,Subcategory,Quantity,Date,Status,Timestamp\n";
      
      // Add data rows
      (filteredRecords as DemandItem[]).forEach(item => {
        csvContent += `"${item.id}","${item.department}","${item.item}","${item.subcategory}",${item.quantity},"${item.date}","${item.status}","${new Date(item.timestamp).toLocaleString()}"\n`;
      });
    } else {
      csvContent = "ID,Demand ID,Patient ID,Item Used,Quantity,Timestamp\n";
      
      // Add data rows
      (filteredRecords as UsageRecord[]).forEach(item => {
        csvContent += `"${item.id}","${item.demandId}","${item.patientId}","${item.itemUsed}",${item.quantity},"${new Date(item.timestamp).toLocaleString()}"\n`;
      });
    }
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique departments for filtering
  const departments = type === "demands" 
    ? [...new Set((records as DemandItem[]).map(item => item.department))]
    : [...new Set(getAllDemands().map(item => item.department))];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold">
          {type === "demands" ? "Emergency Demands" : "Usage Records"}
          {statusFilter && type === "demands" && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Filtered by: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})
            </span>
          )}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-md border border-input"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="relative flex-grow">
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-md border border-input appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          
          <button
            onClick={exportToCSV}
            className="button-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-auto rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground text-sm">
            <tr>
              {type === "demands" ? (
                <>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Item</th>
                  <th className="py-3 px-4 text-left">Subcategory</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 text-left">Patient ID</th>
                  <th className="py-3 px-4 text-left">Item Used</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-left">Timestamp</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                  {type === "demands" ? (
                    <>
                      <td className="py-3 px-4">{(record as DemandItem).department}</td>
                      <td className="py-3 px-4">{(record as DemandItem).item}</td>
                      <td className="py-3 px-4">{(record as DemandItem).subcategory}</td>
                      <td className="py-3 px-4 text-center">{(record as DemandItem).quantity}</td>
                      <td className="py-3 px-4">{(record as DemandItem).date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full text-center w-20 
                          ${(record as DemandItem).status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            (record as DemandItem).status === 'approved' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                          {(record as DemandItem).status.charAt(0).toUpperCase() + (record as DemandItem).status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(record as DemandItem).status === 'pending' && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(record.id, 'approved')}
                              className="p-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-full transition-colors"
                              title="Approve Demand"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(record.id, 'rejected')}
                              className="p-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                              title="Reject Demand"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">{(record as UsageRecord).patientId}</td>
                      <td className="py-3 px-4">{(record as UsageRecord).itemUsed}</td>
                      <td className="py-3 px-4 text-center">{(record as UsageRecord).quantity}</td>
                      <td className="py-3 px-4">{format(new Date((record as UsageRecord).timestamp), "MMM d, yyyy HH:mm")}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={type === "demands" ? 7 : 4} className="py-6 px-4 text-center text-muted-foreground">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  );
};

export default RecordsTable;
