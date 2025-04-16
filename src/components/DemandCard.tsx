
import { useState } from "react";
import { DemandItem, getRemainingStock } from "@/utils/localStorage";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, PackageOpen } from "lucide-react";

interface DemandCardProps {
  demand: DemandItem;
  onSendWhatsApp?: () => void;
}

const DemandCard = ({ demand, onSendWhatsApp }: DemandCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingStock = getRemainingStock(demand.id);
  
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };
  
  // Format the date to "X time ago" (e.g., "2 hours ago")
  const timeAgo = formatDistanceToNow(demand.timestamp, { addSuffix: true });
  
  return (
    <div className="glass-card p-4 mb-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{demand.item}</h3>
          <p className="text-sm text-muted-foreground">{demand.subcategory}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor[demand.status]}`}>
            {demand.status.charAt(0).toUpperCase() + demand.status.slice(1)}
          </span>
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Clock size={12} className="mr-1" />
            {timeAgo}
          </div>
        </div>
      </div>
      
      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between">
          <div className="flex items-center">
            <PackageOpen size={16} className="mr-1 text-primary" />
            <span className="text-sm">Qty: {demand.quantity}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Remaining: </span>
            <span className={remainingStock > 0 ? "text-green-600" : "text-red-600"}>
              {remainingStock}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 border-t pt-3 animate-fade-in">
          <p className="text-sm"><span className="font-medium">Department:</span> {demand.department}</p>
          <p className="text-sm"><span className="font-medium">Date Requested:</span> {demand.date}</p>
        </div>
      )}
      
      <div className="mt-3 flex justify-between">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:underline"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
        
        {onSendWhatsApp && (
          <button 
            onClick={onSendWhatsApp}
            className="flex items-center text-sm text-green-600 hover:text-green-800"
          >
            <MessageSquare size={14} className="mr-1" />
            WhatsApp
          </button>
        )}
      </div>
    </div>
  );
};

export default DemandCard;
