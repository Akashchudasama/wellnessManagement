import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Shield, User, ArrowRight, Clock, Activity, MessagesSquare } from "lucide-react";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Navigate to login page by default if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "incharge") {
        navigate("/incharge");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // This content won't be seen much since we auto-redirect,
  // but we'll keep it nice for completeness
  return (
    <div className="min-h-screen">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary">HMS</span>
        </div>
        
        <div className="flex gap-4">
          {isAuthenticated ? (
            <button 
              onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/incharge')}
              className="button-primary"
            >
              Go to Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="button-primary"
            >
              Login
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            Hospital Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A modern platform for hospital emergency demands and inventory management
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login?role=incharge')}
              className="button-primary flex items-center justify-center space-x-2 px-6"
            >
              <User size={18} />
              <span>Login as Incharge</span>
            </button>
            
            <button 
              onClick={() => navigate('/login?role=admin')}
              className="button-secondary flex items-center justify-center space-x-2 px-6"
            >
              <Shield size={18} />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Demand Management</h3>
            <p className="text-muted-foreground">
              Quickly request emergency items and track their status in real-time. Send urgent requests via WhatsApp.
            </p>
          </div>
          
          <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Usage Tracking</h3>
            <p className="text-muted-foreground">
              Monitor inventory usage with patient tracking. Keep accurate records of all medical supplies.
            </p>
          </div>
          
          <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-full bg-yellow-100 p-4 mb-4">
              <MessagesSquare className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Medical Assistant</h3>
            <p className="text-muted-foreground">
              Get quick guidance on treatments and medications with our built-in AI medical assistant.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            Hospital Management System &copy; {new Date().getFullYear()}
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
