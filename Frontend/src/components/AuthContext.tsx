import React, { useState, useEffect } from "react";
import type { User, AuthResponse } from "../types";
import { api } from "../utils/api";
import { auth } from "../utils/auth";
import { AuthContext } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/auth/me")
            .then((response) => {
                if (response.success) {
                    setUser(response.user);
                } else {
                    auth.removeToken();
                }
            })
            .catch(() => {
                auth.removeToken();
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response: AuthResponse = await api.post("/auth/signin", { email, password });
            if (response.success) {
                setUser(response.user);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const response: AuthResponse = await api.post("/auth/signup", { fullName: name, email, password });
            if (response.success) {
                setUser(response.user);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const logout = async () => {
        const response = await api.post("/auth/logout");
        if (response.success) {
            auth.removeToken();
            setUser(null);
        }
    };

    return <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>{children}</AuthContext.Provider>;
}
