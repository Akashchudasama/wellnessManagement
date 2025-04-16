import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DemandItem, UsageRecord, getAllDemands, getDemandsByIncharge, saveUsageRecord, getRemainingStock, clearUsageRecordsForIncharge, generateId } from "@/utils/localStorage";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Check, Package } from "lucide-react";
import { format } from "date-fns";

const UsageTracker = () => {
  const { user } = useAuth();
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [remainingStock, setRemainingStock] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const inchargeDemands = getDemandsByIncharge(user.id);
      setDemands(inchargeDemands.filter(demand => demand.status !== 'rejected'));
    }
  }, [user]);

  useEffect(() => {
    if (selectedDemand) {
      const remaining = getRemainingStock(selectedDemand);
      setRemainingStock(remaining);
      
      // If quantity is greater than remaining, adjust it
      if (quantity > remaining) {
        setQuantity(remaining > 0 ? remaining : 1);
      }
    } else {
      setRemainingStock(0);
    }
  }, [selectedDemand, quantity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDemand) newErrors.demand = "You must select a demand";
    if (!patientId) newErrors.patientId = "Patient ID is required";
    if (quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (quantity > remainingStock) newErrors.quantity = "Quantity cannot exceed remaining stock";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedDemandObj = demands.find(d => d.id === selectedDemand);
      
      if (!selectedDemandObj) {
        throw new Error("Selected demand not found");
      }
      
      const usageRecord: UsageRecord = {
        id: generateId(),
        demandId: selectedDemandObj.id,
        patientId,
        itemUsed: `${selectedDemandObj.subcategory} ${selectedDemandObj.item}`,
        quantity,
        timestamp: Date.now(),
        inchargeId: user.id
      };
      
      saveUsageRecord(usageRecord);
      
      toast("Usage recorded successfully", {
        description: `Recorded usage of ${quantity} ${selectedDemandObj.subcategory} ${selectedDemandObj.item} for patient ${patientId}.`,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
      
      // Reset form but keep the selected demand
      setPatientId("");
      setQuantity(1);
      
      // Update remaining stock
      const newRemaining = getRemainingStock(selectedDemand);
      setRemainingStock(newRemaining);
      
      // Refresh demands to update remaining stock in UI
      const refreshedDemands = getDemandsByIncharge(user.id);
      setDemands(refreshedDemands.filter(demand => demand.status !== 'rejected'));
      
    } catch (error) {
      toast("Failed to record usage", {
        description: "An error occurred while recording usage. Please try again.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
      console.error("Error recording usage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearRecords = () => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to clear all your usage records? This action cannot be undone.")) {
      try {
        clearUsageRecordsForIncharge(user.id);
        
        toast("Records cleared successfully", {
          description: "All your usage records have been cleared.",
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
        
        // Refresh the demands to update the UI
        const refreshedDemands = getDemandsByIncharge(user.id);
        setDemands(refreshedDemands.filter(demand => demand.status !== 'rejected'));
        
        // Reset the form
        setSelectedDemand("");
        setPatientId("");
        setQuantity(1);
        setRemainingStock(0);
        
      } catch (error) {
        toast("Failed to clear records", {
          description: "An error occurred while clearing your records. Please try again.",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
        console.error("Error clearing records:", error);
      }
    }
  };

  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="card-header">Track Item Usage</h2>
        <button 
          onClick={handleClearRecords}
          className="flex items-center text-sm text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 size={16} className="mr-1" />
          Clear Records
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label-text">Select Demand</label>
          <select 
            value={selectedDemand}
            onChange={(e) => setSelectedDemand(e.target.value)}
            className="input-field"
          >
            <option value="">Select a demand</option>
            {demands.map(demand => (
              <option key={demand.id} value={demand.id}>
                {demand.subcategory} {demand.item} - {format(new Date(demand.timestamp), "MMM d, yyyy")}
              </option>
            ))}
          </select>
          {errors.demand && <p className="text-xs text-red-500 mt-1">{errors.demand}</p>}
        </div>
        
        {selectedDemand && (
          <div className="my-4 p-3 bg-secondary rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Package size={18} className="text-primary mr-2" />
              <span className="text-sm font-medium">Remaining Stock:</span>
            </div>
            <span className={`text-sm font-bold ${remainingStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remainingStock}
            </span>
          </div>
        )}
        
        <div className="form-group">
          <label className="label-text">Patient ID</label>
          <input 
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="input-field"
            placeholder="Enter patient ID"
          />
          {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
        </div>
        
        <div className="form-group">
          <label className="label-text">Quantity Used</label>
          <input 
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            min="1"
            max={remainingStock}
            className="input-field"
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
        </div>
        
        <button 
          type="submit"
          className="button-primary w-full mt-4"
          disabled={isSubmitting || remainingStock === 0}
        >
          {isSubmitting ? "Recording..." : "Record Usage"}
        </button>
      </form>
    </div>
  );
};

export default UsageTracker;
