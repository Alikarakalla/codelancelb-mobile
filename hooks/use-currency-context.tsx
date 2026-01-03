import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types/schema';
import { api } from '@/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CurrencyContextType {
    currency: Currency | null;
    currencies: Currency[];
    setCurrency: (currency: Currency) => Promise<void>;
    isLoading: boolean;
    formatPrice: (price: number | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = '@selected_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrentCurrency] = useState<Currency | null>(null);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load currencies and set default on mount
    useEffect(() => {
        loadCurrencies();
    }, []);

    const loadCurrencies = async () => {
        try {
            setIsLoading(true);

            // Fetch all currencies
            const allCurrencies = await api.getCurrencies();
            setCurrencies(allCurrencies);

            // Try to load saved currency preference
            const savedCurrencyCode = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);

            if (savedCurrencyCode) {
                const savedCurrency = allCurrencies.find(c => c.code === savedCurrencyCode);
                if (savedCurrency) {
                    setCurrentCurrency(savedCurrency);
                    return;
                }
            }

            // If no saved preference, use default currency
            const defaultCurrency = await api.getDefaultCurrency();
            if (defaultCurrency) {
                setCurrentCurrency(defaultCurrency);
            } else if (allCurrencies.length > 0) {
                // Fallback to first currency
                setCurrentCurrency(allCurrencies[0]);
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
            // Set fallback USD currency
            const fallbackCurrency: Currency = {
                id: 0,
                code: 'USD',
                name_en: 'US Dollar',
                name_ar: 'الدولار الأمريكي',
                symbol: '$',
                exchange_rate: 1,
                is_base: true,
                is_active: true,
                sort_order: 0,
            };
            setCurrentCurrency(fallbackCurrency);
            setCurrencies([fallbackCurrency]);
        } finally {
            setIsLoading(false);
        }
    };

    const setCurrency = async (newCurrency: Currency) => {
        setCurrentCurrency(newCurrency);
        // Save preference
        await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency.code);
    };

    const formatPrice = (price: number | null | undefined): string => {
        if (price === null || price === undefined) {
            return currency ? `${currency.symbol}0.00` : '$0.00';
        }

        if (!currency) {
            return `$${price.toFixed(2)}`;
        }

        // Apply exchange rate
        const convertedPrice = price * currency.exchange_rate;

        // Format with currency symbol
        // For RTL currencies (like Arabic), we might want to put symbol after
        const formatted = convertedPrice.toFixed(2);

        // Simple format: symbol + price (you can customize this based on locale)
        return `${currency.symbol}${formatted}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, currencies, setCurrency, isLoading, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
