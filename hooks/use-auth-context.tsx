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
    reloadUser: () => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
    loginWithApple: (payload: {
        identityToken: string;
        authorizationCode?: string | null;
        user?: string | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    }) => Promise<void>;
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

    const reloadUser = async () => {
        // We can leverage the stored token or just check if we have one in state
        const currentToken = token;

        // Actually, we should probably check if we are authenticated
        if (!currentToken) return;

        try {
            const freshUser = await api.getMe();
            setUser(freshUser);
            await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(freshUser));
        } catch (e) {
            console.warn('Failed to reload user:', e);
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

    const loginWithGoogle = async (token: string) => {
        setIsLoading(true);
        try {
            const data = await api.googleLogin(token);
            await saveAuthSession(data.user, data.access_token);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithApple = async (payload: {
        identityToken: string;
        authorizationCode?: string | null;
        user?: string | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    }) => {
        setIsLoading(true);
        try {
            const data = await api.appleLogin(payload);
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
            console.log('Register API Response Success:', JSON.stringify(data, null, 2));
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
            isLoading,
            reloadUser,
            loginWithGoogle,
            loginWithApple
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
