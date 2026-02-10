import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types/schema';

const RECENT_SEARCHES_KEY = 'search_recent_queries_v1';
const RECENTLY_VIEWED_PRODUCTS_KEY = 'search_recently_viewed_products_v1';
const TRENDING_SEARCHES_KEY = 'search_trending_queries_v1';

interface TrendingSearchCache {
    items: string[];
    fetchedAt: number;
}

function scopedStorageKey(baseKey: string, scopeKey: string): string {
    return `${baseKey}:${scopeKey || 'guest'}`;
}

function normalizeQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

function uniqProductsById(products: Product[]): Product[] {
    const seen = new Set<number>();
    const result: Product[] = [];

    products.forEach((product) => {
        if (!product || typeof product.id !== 'number') return;
        if (seen.has(product.id)) return;
        seen.add(product.id);
        result.push(product);
    });

    return result;
}

export async function getLocalRecentSearches(limit = 10, scopeKey: string = 'guest'): Promise<string[]> {
    try {
        const raw = await AsyncStorage.getItem(scopedStorageKey(RECENT_SEARCHES_KEY, scopeKey));
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, limit);
    } catch (error) {
        console.warn('Failed to read local recent searches:', error);
        return [];
    }
}

export async function setLocalRecentSearches(searches: string[], limit = 10, scopeKey: string = 'guest'): Promise<string[]> {
    const normalizedSet = new Set<string>();
    const deduped = searches
        .map((item) => String(item).trim())
        .filter(Boolean)
        .filter((item) => {
            const key = normalizeQuery(item);
            if (normalizedSet.has(key)) return false;
            normalizedSet.add(key);
            return true;
        })
        .slice(0, limit);

    try {
        await AsyncStorage.setItem(scopedStorageKey(RECENT_SEARCHES_KEY, scopeKey), JSON.stringify(deduped));
    } catch (error) {
        console.warn('Failed to persist local recent searches:', error);
    }

    return deduped;
}

export async function saveLocalRecentSearch(query: string, limit = 10, scopeKey: string = 'guest'): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) return getLocalRecentSearches(limit, scopeKey);

    const existing = await getLocalRecentSearches(limit, scopeKey);
    const normalized = normalizeQuery(trimmed);
    const next = [
        trimmed,
        ...existing.filter((item) => normalizeQuery(item) !== normalized),
    ].slice(0, limit);

    return setLocalRecentSearches(next, limit, scopeKey);
}

export async function clearLocalRecentSearches(scopeKey: string = 'guest'): Promise<void> {
    try {
        await AsyncStorage.removeItem(scopedStorageKey(RECENT_SEARCHES_KEY, scopeKey));
    } catch (error) {
        console.warn('Failed to clear local recent searches:', error);
    }
}

export async function getLocalRecentlyViewedProducts(limit = 10, scopeKey: string = 'guest'): Promise<Product[]> {
    try {
        const raw = await AsyncStorage.getItem(scopedStorageKey(RECENTLY_VIEWED_PRODUCTS_KEY, scopeKey));
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return uniqProductsById(parsed as Product[]).slice(0, limit);
    } catch (error) {
        console.warn('Failed to read local recently viewed products:', error);
        return [];
    }
}

export async function setLocalRecentlyViewedProducts(products: Product[], limit = 10, scopeKey: string = 'guest'): Promise<Product[]> {
    const deduped = uniqProductsById(products).slice(0, limit);
    try {
        await AsyncStorage.setItem(scopedStorageKey(RECENTLY_VIEWED_PRODUCTS_KEY, scopeKey), JSON.stringify(deduped));
    } catch (error) {
        console.warn('Failed to persist local recently viewed products:', error);
    }
    return deduped;
}

export async function saveLocalRecentlyViewedProduct(product: Product, limit = 10, scopeKey: string = 'guest'): Promise<Product[]> {
    if (!product || typeof product.id !== 'number') {
        return getLocalRecentlyViewedProducts(limit, scopeKey);
    }

    const existing = await getLocalRecentlyViewedProducts(limit, scopeKey);
    const next = [product, ...existing.filter((item) => item.id !== product.id)].slice(0, limit);
    return setLocalRecentlyViewedProducts(next, limit, scopeKey);
}

export async function getLocalTrendingSearches(
    limit = 10
): Promise<{ items: string[]; fetchedAt: number | null }> {
    try {
        const raw = await AsyncStorage.getItem(TRENDING_SEARCHES_KEY);
        if (!raw) return { items: [], fetchedAt: null };

        const parsed = JSON.parse(raw) as TrendingSearchCache;
        if (!parsed || !Array.isArray(parsed.items) || typeof parsed.fetchedAt !== 'number') {
            return { items: [], fetchedAt: null };
        }

        const items = parsed.items
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, limit);

        return {
            items,
            fetchedAt: parsed.fetchedAt,
        };
    } catch (error) {
        console.warn('Failed to read local trending searches:', error);
        return { items: [], fetchedAt: null };
    }
}

export async function setLocalTrendingSearches(items: string[], limit = 10): Promise<string[]> {
    const normalizedSet = new Set<string>();
    const deduped = items
        .map((item) => String(item).trim())
        .filter(Boolean)
        .filter((item) => {
            const key = normalizeQuery(item);
            if (normalizedSet.has(key)) return false;
            normalizedSet.add(key);
            return true;
        })
        .slice(0, limit);

    try {
        const payload: TrendingSearchCache = {
            items: deduped,
            fetchedAt: Date.now(),
        };
        await AsyncStorage.setItem(TRENDING_SEARCHES_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('Failed to persist local trending searches:', error);
    }

    return deduped;
}
