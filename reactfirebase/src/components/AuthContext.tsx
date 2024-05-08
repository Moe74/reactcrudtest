import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  email: string | null;
  setEmaile: (value: string | null) => void;
  name: string | null;
  setName: (value: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem("isAdmin") === "true";
  });

  const [email, setEmail] = useState<string | null>(() => {
    return sessionStorage.getItem("email");
  });

  const [name, setName] = useState<string | null>(() => {
    return sessionStorage.getItem("name");
  });

  useEffect(() => {
    sessionStorage.setItem("isLoggedIn", String(isLoggedIn));
    sessionStorage.setItem("isAdmin", String(isAdmin));
    sessionStorage.setItem("email", email ?? "");
    sessionStorage.setItem("name", name ?? "");
  }, [isLoggedIn, isAdmin, email, name]);

  const auth = {
    isLoggedIn,
    setIsLoggedIn,
    isAdmin,
    setIsAdmin,
    email,
    setEmail,
    name,
    setName,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
