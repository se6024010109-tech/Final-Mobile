// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("user");

      if (token) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, userData) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const signOut = async () => {
    try {
      console.log("[AuthContext] signOut: removing token from AsyncStorage");
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("user");
      console.log(
        "[AuthContext] signOut: cleared AsyncStorage, setting userToken to null"
      );
      setUserToken(null);
      setUser(null);
      console.log(
        "[AuthContext] signOut: state updated, should navigate to Auth"
      );
    } catch (error) {
      console.error("[AuthContext] Error removing token:", error);
      // Still clear state even if storage fails - user can re-login
      setUserToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userToken, user, isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
