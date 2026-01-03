import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/schema';
import { api, setApiToken } from '@/services/apiClient';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            const storedUser = await SecureStore.getItemAsync(AUTH_USER_KEY);

            if (storedToken && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setApiToken(storedToken);
                console.log('Restored session for:', parsedUser.email);
            }
        } catch (e) {
            console.warn('Failed to restore auth session:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const data = await api.login(credentials);
            await saveAuthSession(data.user, data.access_token);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            const data = await api.register(userData);
            await saveAuthSession(data.user, data.access_token);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const saveAuthSession = async (user: User, token: string) => {
        setUser(user);
        setToken(token);
        setApiToken(token);
        console.log('--- AUTH SUCCESS ---');
        console.log('User:', JSON.stringify(user, null, 2));
        console.log('Token:', token);
        console.log('--------------------');
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await api.logout();
        } catch (e) {
            console.warn('Logout API failed, but clearing local state moreover.');
        } finally {
            setUser(null);
            setToken(null);
            setApiToken(null);
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(AUTH_USER_KEY);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            login,
            register,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
