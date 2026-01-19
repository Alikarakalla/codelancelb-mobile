import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
    categoryIds: number[];
    brandIds: number[];
    priceRange: [number, number];
    sortInfo: string;
    searchQuery: string;
    color: string | null;
    size: string | null;
}

interface FilterContextType {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    updateFilter: (key: keyof FilterState, value: any) => void;
    clearFilters: () => void;
}

const defaultFilters: FilterState = {
    categoryIds: [],
    brandIds: [],
    priceRange: [0, 1000],
    sortInfo: 'newest',
    searchQuery: '',
    color: null,
    size: null
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <FilterContext.Provider value={{ filters, setFilters, updateFilter, clearFilters }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}
