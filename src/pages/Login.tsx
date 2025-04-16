
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertTriangle, Check, LockKeyhole, User, UserCircle2, Shield } from "lucide-react";

const Login = () => {
  const [role, setRole] = useState<"admin" | "incharge">("incharge");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password, role);
      
      if (success) {
        toast("Login successful", {
          description: `Welcome back, ${username}!`,
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
        
        navigate(role === "admin" ? "/admin" : "/incharge");
      } else {
        toast("Login failed", {
          description: "Invalid username or password. Please try again.",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
        
        setErrors({
          auth: "Invalid username or password"
        });
      }
    } catch (error) {
      toast("Login error", {
        description: "An error occurred during login. Please try again.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-primary">Hospital Management System</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>
        
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  role === "incharge"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-secondary"
                }`}
                onClick={() => setRole("incharge")}
              >
                <User size={16} className="inline mr-2" />
                Incharge
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  role === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-secondary"
                }`}
                onClick={() => setRole("admin")}
              >
                <Shield size={16} className="inline mr-2" />
                Admin
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {errors.auth && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                {errors.auth}
              </div>
            )}
            
            <div className="form-group">
              <label className="label-text">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder={role === "admin" ? "admin" : "incharge"}
                />
                <UserCircle2 size={18} className="absolute left-3 top-2.5 text-muted-foreground" />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>
            
            <div className="form-group">
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
                <LockKeyhole size={18} className="absolute left-3 top-2.5 text-muted-foreground" />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            
            <button
              type="submit"
              className="button-primary w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>For demo purposes:</p>
            <p>Admin: username "admin" / password "admin123"</p>
            <p>Incharge: username "incharge" / password "incharge123"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
