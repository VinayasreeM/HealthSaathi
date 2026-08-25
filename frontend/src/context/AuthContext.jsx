import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication from localStorage on initial application load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in user
   * Calls the backend authentication API: POST /auth/login
   */
  const login = async (email, password) => {
    setLoading(true);

    try {
      const data = await api.post("/auth/login", {
        email,
        password,
      });

      if (!data || !data.token || !data.user) {
        throw new Error(data?.message || "Invalid authentication response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user
   * Calls the backend authentication API: POST /auth/register
   */
  const register = async (userData) => {
    setLoading(true);

    try {
      const data = await api.post("/auth/register", userData);

      if (!data || !data.token || !data.user) {
        throw new Error(data?.message || "Invalid registration response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   * Clears saved token and user from localStorage and resets state
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}