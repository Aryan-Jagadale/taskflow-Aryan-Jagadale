import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("taskflow_token");
    const savedUser = localStorage.getItem("taskflow_user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // Keep token session if user payload is corrupted; user can be refreshed later.
          localStorage.removeItem("taskflow_user");
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "taskflow_token") {
        setToken(event.newValue);
      }
      if (event.key === "taskflow_user") {
        if (!event.newValue) {
          setUser(null);
          return;
        }
        try {
          setUser(JSON.parse(event.newValue));
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("taskflow_token", newToken);
    localStorage.setItem("taskflow_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
