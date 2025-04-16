
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleHome = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "incharge") {
      navigate("/incharge");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="glass-card px-6 py-4 mb-8 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-semibold text-primary">HMS</span>
      </div>
      
      <div className="flex items-center space-x-6">
        {user && (
          <>
            <button 
              onClick={handleHome}
              className="flex items-center space-x-1 nav-link"
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User size={16} />
              <span>{user.name}</span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                {user.role === "admin" ? "Admin" : "Incharge"}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-destructive nav-link"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
