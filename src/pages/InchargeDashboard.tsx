
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EmergencyDemandForm from "@/components/EmergencyDemandForm";
import UsageTracker from "@/components/UsageTracker";
import MedicalChatbot from "@/components/MedicalChatbot";
import DemandCard from "@/components/DemandCard";
import { useAuth } from "@/context/AuthContext";
import { getDemandsByIncharge, getUsageRecordsByIncharge, DemandItem, UsageRecord } from "@/utils/localStorage";
import { useNavigate } from "react-router-dom";
import { PackageOpen, MessageSquare, AlertTriangle, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

const InchargeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentDemands, setRecentDemands] = useState<DemandItem[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [openChat, setOpenChat] = useState(false);
  const [showDemands, setShowDemands] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!user || user.role !== 'incharge') {
      navigate('/login');
      return;
    }
    
    const fetchData = () => {
      if (user) {
        // Fetch demands
        const demands = getDemandsByIncharge(user.id);
        // Sort by timestamp (newest first) and get the most recent 5
        const sortedDemands = demands.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        setRecentDemands(sortedDemands);
        
        // Fetch usage records
        const records = getUsageRecordsByIncharge(user.id);
        const sortedRecords = records.sort((a, b) => b.timestamp - a.timestamp);
        setUsageRecords(sortedRecords);
      }
    };
    
    fetchData();
    
    // Set up an interval to refresh the data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleSendWhatsApp = (demand: DemandItem) => {
    const message = encodeURIComponent(
      `EMERGENCY DEMAND REQUEST\n\nDepartment: ${demand.department}\nItem: ${demand.item}\nSubcategory: ${demand.subcategory}\nQuantity: ${demand.quantity}\nDate: ${demand.date}\nStatus: ${demand.status}\n\nRequested by: ${user?.name || 'Incharge'}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Mobile uses a drawer, desktop uses a dialog
  const ChatComponent = () => {
    if (isMobile) {
      return (
        <Drawer open={openChat} onOpenChange={setOpenChat}>
          <DrawerContent className="h-[85vh]">
            <div className="h-full overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Medical Assistant
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpenChat(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-0 h-[calc(100%-60px)]">
                <MedicalChatbot />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={openChat} onOpenChange={setOpenChat}>
        <DialogContent className="sm:max-w-[425px] h-[600px] p-0">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Medical Assistant
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpenChat(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MedicalChatbot />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container">
        <Navbar />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Incharge Dashboard</h1>
          <p className="text-muted-foreground">Manage emergency demands and track item usage</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="dashboard-card p-6 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <PackageOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Recent Demands</p>
                  <h3 className="text-2xl font-bold">{recentDemands.length}</h3>
                </div>
              </div>
              
              <div className="dashboard-card p-6 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">AI Assistant</p>
                  <h3 className="text-2xl font-bold">Available</h3>
                </div>
              </div>
              
              <div className="dashboard-card p-6 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Usage Records</p>
                  <h3 className="text-2xl font-bold">{usageRecords.length}</h3>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmergencyDemandForm />
              <UsageTracker />
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <Collapsible 
              open={showDemands} 
              onOpenChange={setShowDemands} 
              className="dashboard-card w-full"
            >
              <CollapsibleTrigger className="w-full text-left p-4 flex justify-between items-center border-b cursor-pointer hover:bg-muted/20 transition-colors">
                <h2 className="font-semibold text-lg flex items-center">
                  <PackageOpen className="mr-2 h-5 w-5 text-primary" />
                  Recent Demands
                </h2>
                <div>
                  {showDemands ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="p-4">
                {recentDemands.length > 0 ? (
                  <div>
                    {recentDemands.map(demand => (
                      <DemandCard 
                        key={demand.id} 
                        demand={demand} 
                        onSendWhatsApp={() => handleSendWhatsApp(demand)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Recent Demands</h3>
                    <p className="text-muted-foreground">Use the form on the left to create a new emergency demand.</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={showUsage} 
              onOpenChange={setShowUsage} 
              className="dashboard-card w-full"
            >
              <CollapsibleTrigger className="w-full text-left p-4 flex justify-between items-center border-b cursor-pointer hover:bg-muted/20 transition-colors">
                <h2 className="font-semibold text-lg flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-yellow-600" />
                  Usage Records
                </h2>
                <div>
                  {showUsage ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="p-4">
                {usageRecords.length > 0 ? (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Item Used</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usageRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.patientId}</TableCell>
                            <TableCell>{record.itemUsed}</TableCell>
                            <TableCell className="text-center">{record.quantity}</TableCell>
                            <TableCell>{format(new Date(record.timestamp), "MMM d, yyyy")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Usage Records</h3>
                    <p className="text-muted-foreground">Use the tracker on the left to record item usage.</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Chat dialog/drawer component */}
        <ChatComponent />
        
        {/* Floating chat button */}
        <Button
          onClick={() => setOpenChat(true)}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0 animate-fade-in"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default InchargeDashboard;
