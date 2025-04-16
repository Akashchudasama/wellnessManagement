
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveDemand, generateId } from "@/utils/localStorage";
import { toast } from "sonner";
import { AlertTriangle, Check } from "lucide-react";

// Mock department and item data
const departments = ["Emergency", "Surgery", "Pediatrics", "Cardiology", "Neurology"];
const itemsByDepartment = {
  "Emergency": ["Bandages", "IV Fluids", "Oxygen Cylinders", "First Aid Kit", "Sutures"],
  "Surgery": ["Surgical Gloves", "Scalpels", "Sutures", "Anesthetics", "Surgical Masks"],
  "Pediatrics": ["Infant Oxygen Masks", "Pediatric IV Sets", "Baby Scales", "Infant Warmers"],
  "Cardiology": ["ECG Electrodes", "Defibrillator Pads", "Cardiac Monitors", "Stents"],
  "Neurology": ["Lumbar Puncture Kits", "Reflex Hammers", "EEG Electrodes", "Nerve Conduction Gels"]
};
const subcategoriesByItem = {
  "Bandages": ["Adhesive", "Gauze", "Compression", "Elastic"],
  "IV Fluids": ["Normal Saline", "Dextrose", "Ringer's Lactate"],
  "Oxygen Cylinders": ["Portable", "Large", "Medium"],
  "First Aid Kit": ["Basic", "Advanced", "Trauma"],
  "Sutures": ["Absorbable", "Non-absorbable", "Surgical Silk"],
  "Surgical Gloves": ["Latex", "Nitrile", "Powder-free"],
  "Scalpels": ["Disposable", "Reusable", "Precision"],
  "Anesthetics": ["Local", "General", "Regional"],
  "Surgical Masks": ["Standard", "N95", "HEPA"],
  "Infant Oxygen Masks": ["Neonatal", "Infant", "Toddler"],
  "Pediatric IV Sets": ["Micro-drip", "Macro-drip", "Extension Sets"],
  "Baby Scales": ["Digital", "Mechanical", "Portable"],
  "Infant Warmers": ["Radiant", "Incubator", "Transport"],
  "ECG Electrodes": ["Adult", "Pediatric", "Disposable"],
  "Defibrillator Pads": ["Adult", "Pediatric", "Training"],
  "Cardiac Monitors": ["Portable", "Bedside", "Telemetry"],
  "Stents": ["Coronary", "Peripheral", "Drug-eluting"],
  "Lumbar Puncture Kits": ["Adult", "Pediatric", "Diagnostic"],
  "Reflex Hammers": ["Taylor", "Buck", "Babinski"],
  "EEG Electrodes": ["Cup", "Needle", "Adhesive"],
  "Nerve Conduction Gels": ["Conductive", "Hypoallergenic", "Sterile"]
};

const EmergencyDemandForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    department: "",
    item: "",
    subcategory: "",
    quantity: 1,
    date: new Date().toISOString().split('T')[0]
  });
  
  const [items, setItems] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.item) newErrors.item = "Item is required";
    if (!formData.subcategory) newErrors.subcategory = "Subcategory is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.date) newErrors.date = "Date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const department = e.target.value;
    setFormData({
      ...formData,
      department,
      item: "",
      subcategory: ""
    });
    
    setItems(department ? itemsByDepartment[department as keyof typeof itemsByDepartment] || [] : []);
    setSubcategories([]);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = e.target.value;
    setFormData({
      ...formData,
      item,
      subcategory: ""
    });
    
    setSubcategories(item ? subcategoriesByItem[item as keyof typeof subcategoriesByItem] || [] : []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newDemand = {
        id: generateId(),
        ...formData,
        timestamp: Date.now(),
        status: 'pending' as const,
        inchargeId: user?.id || ''
      };
      
      saveDemand(newDemand);
      
      toast("Demand submitted successfully", {
        description: `Your request for ${formData.quantity} ${formData.subcategory} ${formData.item} has been submitted.`,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
      
      // Reset form
      setFormData({
        department: "",
        item: "",
        subcategory: "",
        quantity: 1,
        date: new Date().toISOString().split('T')[0]
      });
      setItems([]);
      setSubcategories([]);
      
    } catch (error) {
      toast("Failed to submit demand", {
        description: "An error occurred while submitting your demand. Please try again.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
      console.error("Error submitting demand:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validateForm()) {
      return;
    }
    
    const message = encodeURIComponent(
      `EMERGENCY DEMAND REQUEST\n\nDepartment: ${formData.department}\nItem: ${formData.item}\nSubcategory: ${formData.subcategory}\nQuantity: ${formData.quantity}\nDate: ${formData.date}\n\nRequested by: ${user?.name || 'Incharge'}`
    );
    
    // Using the WhatsApp API to open a chat window - replace with actual admin's phone number
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="dashboard-card">
      <h2 className="card-header">Place Emergency Demand</h2>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="form-group">
          <label className="label-text">Department</label>
          <select 
            name="department"
            value={formData.department}
            onChange={handleDepartmentChange}
            className="input-field"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
        </div>
        
        <div className="form-group">
          <label className="label-text">Item</label>
          <select 
            name="item"
            value={formData.item}
            onChange={handleItemChange}
            className="input-field"
            disabled={!formData.department}
          >
            <option value="">Select Item</option>
            {items.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          {errors.item && <p className="text-xs text-red-500 mt-1">{errors.item}</p>}
        </div>
        
        <div className="form-group">
          <label className="label-text">Subcategory</label>
          <select 
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="input-field"
            disabled={!formData.item}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          {errors.subcategory && <p className="text-xs text-red-500 mt-1">{errors.subcategory}</p>}
        </div>
        
        <div className="form-group">
          <label className="label-text">Quantity</label>
          <input 
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="input-field"
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
        </div>
        
        <div className="form-group">
          <label className="label-text">Date Needed</label>
          <input 
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input-field"
          />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button 
            type="submit"
            className="button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Demand"}
          </button>
          
          <button 
            type="button"
            onClick={handleWhatsApp}
            className="button-accent"
          >
            Send via WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyDemandForm;
