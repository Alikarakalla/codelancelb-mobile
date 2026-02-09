import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from '@/services/apiClient';
import { Product, Brand, Category } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import {
    clearLocalRecentSearches,
    getLocalRecentSearches,
    getLocalRecentlyViewedProducts,
    getLocalTrendingSearches,
    saveLocalRecentSearch,
    setLocalRecentSearches,
    setLocalRecentlyViewedProducts,
    setLocalTrendingSearches,
} from '@/utils/searchStorage';

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getProductSearchFields(product: Product): string[] {
    return [
        product.name_en || '',
        product.name || '',
        product.name_ar || '',
        product.slug || '',
        product.sku || '',
    ].map(v => normalizeSearchText(v)).filter(Boolean);
}

function hasExactProductMatch(product: Product, query: string): boolean {
    const q = normalizeSearchText(query);
    if (!q) return false;

    return getProductSearchFields(product).some(field => field === q);
}

function rankProductsByQuery(products: Product[], query: string): Product[] {
    const q = normalizeSearchText(query);
    if (!q) return products;

    const scored = products.map((product, index) => {
        const fields = getProductSearchFields(product);
        let score = 0;

        for (const field of fields) {
            if (!field) continue;
            if (field === q) score = Math.max(score, 100);
            else if (field.startsWith(q)) score = Math.max(score, 80);
            else if (field.includes(` ${q} `) || field.includes(q)) score = Math.max(score, 60);
        }

        return { product, score, index };
    });

    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
    });

    return scored.map(item => item.product);
}

function dedupeProductsById(products: Product[]): Product[] {
    const seen = new Set<number>();
    const unique: Product[] = [];
    products.forEach(product => {
        if (!seen.has(product.id)) {
            seen.add(product.id);
            unique.push(product);
        }
    });
    return unique;
}

const RECENT_SEARCH_LIMIT = 10;
const RECENTLY_VIEWED_LIMIT = 10;
const TRENDING_SEARCH_LIMIT = 10;
const TRENDING_CACHE_TTL_MS = 10 * 60 * 1000;

function mergeSearches(primary: string[], secondary: string[], limit = RECENT_SEARCH_LIMIT): string[] {
    const normalized = new Set<string>();
    const merged = [...primary, ...secondary]
        .map(item => item.trim())
        .filter(Boolean)
        .filter(item => {
            const key = normalizeSearchText(item);
            if (!key || normalized.has(key)) return false;
            normalized.add(key);
            return true;
        })
        .slice(0, limit);
    return merged;
}

export default function SearchIndex() {
    const router = useRouter();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [brandResults, setBrandResults] = useState<Brand[]>([]);
    const [categoryResults, setCategoryResults] = useState<Category[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
    const latestSearchRequestRef = useRef(0);

    // Listen to native search bar changes
    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                onChangeText: (event: any) => {
                    setSearchQuery(event.nativeEvent.text);
                },
                textColor: isDark ? '#FFFFFF' : '#000000',
                hintTextColor: isDark ? '#9CA3AF' : '#6B7280',
                headerIconColor: isDark ? '#FFFFFF' : '#000000',
            },
        });
    }, [navigation, isDark]);

    useEffect(() => {
        loadRecentSearches();
        loadTrendingSearches();
        loadRecentlyViewedProducts();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadRecentSearches();
            loadTrendingSearches();
            loadRecentlyViewedProducts();
        });
        return unsubscribe;
    }, [navigation]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery.length >= 2) {
                performSearch(trimmedQuery);
            } else {
                latestSearchRequestRef.current += 1; // invalidate in-flight searches
                setIsSearching(false);
                setSearchResults([]);
                setBrandResults([]);
                setCategoryResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const loadRecentSearches = async () => {
        try {
            const local = await getLocalRecentSearches(RECENT_SEARCH_LIMIT);
            if (local.length > 0) {
                setRecentSearches(local);
            } else {
                setRecentSearches([]);
            }

            const remote = await api.getSearchHistory(RECENT_SEARCH_LIMIT);
            if (remote.length > 0) {
                const merged = mergeSearches(remote, local, RECENT_SEARCH_LIMIT);
                setRecentSearches(merged);
                await setLocalRecentSearches(merged, RECENT_SEARCH_LIMIT);
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const loadTrendingSearches = async () => {
        try {
            const localTrending = await getLocalTrendingSearches(TRENDING_SEARCH_LIMIT);
            if (localTrending.items.length > 0) {
                setTrendingSearches(localTrending.items);
            } else {
                setTrendingSearches([]);
            }

            const isCacheFresh =
                localTrending.fetchedAt !== null &&
                (Date.now() - localTrending.fetchedAt) < TRENDING_CACHE_TTL_MS;

            if (isCacheFresh) return;

            const remoteTrending = await api.getTrendingSearches(TRENDING_SEARCH_LIMIT);
            if (remoteTrending.length > 0) {
                setTrendingSearches(remoteTrending);
                await setLocalTrendingSearches(remoteTrending, TRENDING_SEARCH_LIMIT);
            }
        } catch (error) {
            console.error('Error loading trending searches:', error);
        }
    };

    const loadRecentlyViewedProducts = async () => {
        try {
            const local = await getLocalRecentlyViewedProducts(RECENTLY_VIEWED_LIMIT);
            if (local.length > 0) {
                setRecentlyViewedProducts(local);
            } else {
                setRecentlyViewedProducts([]);
            }

            const remote = await api.getRecentlyViewedProducts(RECENTLY_VIEWED_LIMIT);
            if (remote.length > 0) {
                const merged = dedupeProductsById([...remote, ...local]).slice(0, RECENTLY_VIEWED_LIMIT);
                setRecentlyViewedProducts(merged);
                await setLocalRecentlyViewedProducts(merged, RECENTLY_VIEWED_LIMIT);
            }
        } catch (error) {
            console.error('Error loading recently viewed products:', error);
        }
    };

    const performSearch = async (query: string) => {
        const requestId = ++latestSearchRequestRef.current;
        setIsSearching(true);
        try {
            // Search products, brands, and categories in parallel
            const [products, allBrands, allCategories] = await Promise.all([
                api.getProducts({ search: query, limit: 100, page: 1 }),
                api.getBrands(),
                api.getCategories()
            ]);

            if (requestId !== latestSearchRequestRef.current) return;

            let rankedProducts = rankProductsByQuery(products, query);
            const hasExact = rankedProducts.some(product => hasExactProductMatch(product, query));

            // If exact match not present in first page, fetch more pages and rerank.
            if (!hasExact) {
                const [page2, page3] = await Promise.all([
                    api.getProducts({ search: query, limit: 100, page: 2 }),
                    api.getProducts({ search: query, limit: 100, page: 3 }),
                ]);

                if (requestId !== latestSearchRequestRef.current) return;

                rankedProducts = rankProductsByQuery(
                    dedupeProductsById([...products, ...page2, ...page3]),
                    query
                );
            }

            setSearchResults(rankedProducts);

            // Filter brands
            const filteredBrands = allBrands.filter(brand =>
                [brand.name, brand.name_en, brand.name_ar]
                    .filter((name): name is string => Boolean(name))
                    .some(name => normalizeSearchText(name).includes(normalizeSearchText(query)))
            );
            setBrandResults(filteredBrands.slice(0, 5));

            // Filter categories
            const filteredCategories = allCategories.filter(category =>
                [category.name, category.name_en, category.name_ar]
                    .filter((name): name is string => Boolean(name))
                    .some(name => normalizeSearchText(name).includes(normalizeSearchText(query)))
            );
            setCategoryResults(filteredCategories.slice(0, 5));

            // Save to recent searches only if query is meaningful
            if (query.trim().length >= 2) {
                saveRecentSearch(query);
            }
        } catch (error) {
            if (requestId !== latestSearchRequestRef.current) return;
            console.error('Search error:', error);
            setSearchResults([]);
            setBrandResults([]);
            setCategoryResults([]);
        } finally {
            if (requestId === latestSearchRequestRef.current) {
                setIsSearching(false);
            }
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            const trimmed = query.trim();
            if (trimmed.length < 2) return;

            const updated = await saveLocalRecentSearch(trimmed, RECENT_SEARCH_LIMIT);
            setRecentSearches(updated);
            await api.saveSearchQuery(trimmed);
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const handleBrandPress = (brandId: number) => {
        router.push(`/shop?brand_id=${brandId}`);
    };

    const handleCategoryPress = (categoryId: number) => {
        router.push(`/shop?category_id=${categoryId}`);
    };

    const handleRecentSearch = (query: string) => {
        setSearchQuery(query);
    };

    const clearRecentSearches = async () => {
        try {
            await clearLocalRecentSearches();
            setRecentSearches([]);
            await api.clearSearchHistory();
        } catch (error) {
            console.error('Error clearing recent searches:', error);
        }
    };

    const hasResults = searchResults.length > 0 ||
        brandResults.length > 0 ||
        categoryResults.length > 0;

    return (
        <ScrollView
            style={[styles.container, isDark && styles.containerDark]}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
        >
            {isSearching ? (
                <View style={[styles.section, { paddingHorizontal: 16 }]}>
                    <View style={styles.productsGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.productCardStyle,
                                    {
                                        backgroundColor: isDark ? '#1C1C1E' : '#fff',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        marginBottom: 16,
                                    }
                                ]}
                            >
                                {/* Image Skeleton */}
                                <View style={{ height: 180, backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }} />
                                {/* Content Skeleton */}
                                <View style={{ padding: 12, gap: 8 }}>
                                    <View style={{ height: 12, width: '60%', backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB', borderRadius: 4 }} />
                                    <View style={{ height: 14, width: '90%', backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB', borderRadius: 4 }} />
                                    <View style={{ height: 14, width: '40%', backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB', borderRadius: 4 }} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            ) : searchQuery.length > 0 && hasResults ? (
                <>
                    {/* Brands Results */}
                    {brandResults.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Brands ({brandResults.length})
                                </Text>
                            </View>
                            <View style={styles.chipContainer}>
                                {brandResults.map((brand) => (
                                    <Pressable
                                        key={brand.id}
                                        style={[styles.chip, isDark && styles.chipDark]}
                                        onPress={() => handleBrandPress(brand.id)}
                                    >
                                        <Feather name="tag" size={14} color={isDark ? '#9CA3AF' : '#666'} />
                                        <Text style={[styles.chipText, isDark && styles.chipTextDark]}>
                                            {brand.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Categories Results */}
                    {categoryResults.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Categories ({categoryResults.length})
                                </Text>
                            </View>
                            <View style={styles.chipContainer}>
                                {categoryResults.map((category) => (
                                    <Pressable
                                        key={category.id}
                                        style={[styles.chip, isDark && styles.chipDark]}
                                        onPress={() => handleCategoryPress(category.id)}
                                    >
                                        <Feather name="folder" size={14} color={isDark ? '#9CA3AF' : '#666'} />
                                        <Text style={[styles.chipText, isDark && styles.chipTextDark]}>
                                            {category.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Products Results - GRID LAYOUT */}
                    {searchResults.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Results ({searchResults.length})
                                </Text>
                            </View>
                            <View style={styles.productsGrid}>
                                {searchResults.map((product) => (
                                    <ShopProductCard
                                        key={product.id}
                                        product={product}
                                        style={styles.productCardStyle}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </>
            ) : searchQuery.length > 0 && !hasResults ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, isDark && styles.textGrayDark]}>
                        No results found for &quot;{searchQuery}&quot;
                    </Text>
                </View>
            ) : (
                <>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Recent Searches
                                </Text>
                                <Pressable onPress={clearRecentSearches}>
                                    <Text style={styles.clearAllText}>Clear All</Text>
                                </Pressable>
                            </View>
                            <View style={styles.chipContainer}>
                                {recentSearches.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={[styles.chip, isDark && styles.chipDark]}
                                        onPress={() => handleRecentSearch(item)}
                                    >
                                        <Feather name="clock" size={14} color={isDark ? '#9CA3AF' : '#666'} />
                                        <Text style={[styles.chipText, isDark && styles.chipTextDark]}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Trending Searches */}
                    {trendingSearches.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Trending Now
                                </Text>
                            </View>
                            <View style={styles.chipContainer}>
                                {trendingSearches.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={[styles.chip, styles.trendingChip, isDark && styles.chipDark]}
                                        onPress={() => handleRecentSearch(item)}
                                    >
                                        <Feather name="trending-up" size={14} color={isDark ? '#fff' : '#000'} />
                                        <Text style={[styles.chipText, isDark && styles.chipTextDark]}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Recently Viewed Products */}
                    {recentlyViewedProducts.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                    Recently Viewed
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalScroll}
                            >
                                {recentlyViewedProducts.map((product) => (
                                    <ShopProductCard
                                        key={product.id}
                                        product={product}
                                        style={{ width: 160 }}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    textDark: {
        color: '#FFFFFF',
    },
    textGrayDark: {
        color: '#9CA3AF',
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007AFF',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chipDark: {
        backgroundColor: 'rgba(28, 28, 30, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    trendingChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1C1C1E',
    },
    chipTextDark: {
        color: '#FFFFFF',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        gap: 12,
    },
    productCardStyle: {
        width: '48%',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    horizontalScroll: {
        gap: 12,
        paddingHorizontal: 16,
    },
});
