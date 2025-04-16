
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RecordsTable from "@/components/RecordsTable";
import { useAuth } from "@/context/AuthContext";
import { getAllDemands, getAllUsageRecords, resetAllData } from "@/utils/localStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Check, BarChart3, FileText, Trash2, Users } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"demands" | "usage">("demands");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stats, setStats] = useState({
    totalDemands: 0,
    pendingDemands: 0,
    totalUsage: 0,
    departmentDistribution: {} as Record<string, number>
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    calculateStats();
  }, [user, navigate]);

  const calculateStats = () => {
    const demands = getAllDemands();
    const usageRecords = getAllUsageRecords();
    
    const pendingDemands = demands.filter(demand => demand.status === 'pending').length;
    
    const departments: Record<string, number> = {};
    demands.forEach(demand => {
      departments[demand.department] = (departments[demand.department] || 0) + 1;
    });
    
    setStats({
      totalDemands: demands.length,
      pendingDemands,
      totalUsage: usageRecords.length,
      departmentDistribution: departments
    });
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all system data? This action cannot be undone.")) {
      try {
        resetAllData();
        
        toast("Data reset successful", {
          description: "All system data has been cleared.",
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
        
        calculateStats();
      } catch (error) {
        toast("Data reset failed", {
          description: "An error occurred while resetting data. Please try again.",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
        console.error("Error resetting data:", error);
      }
    }
  };

  // Handle card click to filter records
  const handleCardClick = (cardType: string) => {
    if (cardType === 'pending') {
      setActiveTab("demands");
      setStatusFilter("pending");
    } else if (cardType === 'totalDemands') {
      setActiveTab("demands");
      setStatusFilter("");
    } else if (cardType === 'totalUsage') {
      setActiveTab("usage");
      setStatusFilter("");
    }
  };

  // Get top departments
  const topDepartments = Object.entries(stats.departmentDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container">
        <Navbar />
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage hospital emergency demands and usage</p>
          </div>
          
          <button
            onClick={handleResetData}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            <span>Reset All Data</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="dashboard-card p-6 flex items-center cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={() => handleCardClick('totalDemands')}
          >
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Demands</p>
              <h3 className="text-2xl font-bold">{stats.totalDemands}</h3>
            </div>
          </div>
          
          <div 
            className="dashboard-card p-6 flex items-center cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={() => handleCardClick('pending')}
          >
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Pending Demands</p>
              <h3 className="text-2xl font-bold">{stats.pendingDemands}</h3>
            </div>
          </div>
          
          <div 
            className="dashboard-card p-6 flex items-center cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={() => handleCardClick('totalUsage')}
          >
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Usage Records</p>
              <h3 className="text-2xl font-bold">{stats.totalUsage}</h3>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="dashboard-card p-6 lg:w-1/2">
            <div className="flex items-center mb-4">
              <BarChart3 className="mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Department Distribution</h3>
            </div>
            
            {topDepartments.length > 0 ? (
              <div className="space-y-4">
                {topDepartments.map(([dept, count]) => (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{dept}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(count / Math.max(...Object.values(stats.departmentDistribution))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No department data available</p>
            )}
          </div>
          
          <div className="dashboard-card p-6 lg:w-1/2">
            <div className="flex items-center mb-4">
              <BarChart3 className="mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setActiveTab("demands");
                  setStatusFilter("");
                }}
                className={`p-4 rounded-lg border ${
                  activeTab === "demands" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                } transition-colors text-left`}
              >
                <FileText className="mb-2 text-primary" />
                <h4 className="font-medium">View Demands</h4>
                <p className="text-xs text-muted-foreground mt-1">Review all emergency demand requests</p>
              </button>
              
              <button 
                onClick={() => {
                  setActiveTab("usage");
                  setStatusFilter("");
                }}
                className={`p-4 rounded-lg border ${
                  activeTab === "usage" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                } transition-colors text-left`}
              >
                <Users className="mb-2 text-primary" />
                <h4 className="font-medium">View Usage</h4>
                <p className="text-xs text-muted-foreground mt-1">Review all item usage records</p>
              </button>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <div className="border-b mb-6">
            <div className="flex space-x-6">
              <button
                onClick={() => {
                  setActiveTab("demands");
                  setStatusFilter("");
                }}
                className={`pb-2 px-1 font-medium ${
                  activeTab === "demands"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                } transition-colors`}
              >
                Emergency Demands
              </button>
              
              <button
                onClick={() => {
                  setActiveTab("usage");
                  setStatusFilter("");
                }}
                className={`pb-2 px-1 font-medium ${
                  activeTab === "usage"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                } transition-colors`}
              >
                Usage Records
              </button>
            </div>
          </div>
          
          <RecordsTable 
            type={activeTab} 
            onDataChange={calculateStats}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
