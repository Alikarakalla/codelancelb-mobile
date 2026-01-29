import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { api } from '@/services/apiClient';
import { Product, Brand, Category } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShopProductCard } from '@/components/shop/ShopProductCard';

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

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
                setBrandResults([]);
                setCategoryResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const loadRecentSearches = async () => {
        try {
            // TODO: Load from AsyncStorage
            setRecentSearches([]);
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const loadTrendingSearches = async () => {
        try {
            // TODO: Implement trending searches API endpoint
            setTrendingSearches([]);
        } catch (error) {
            console.error('Error loading trending searches:', error);
        }
    };

    const loadRecentlyViewedProducts = async () => {
        try {
            // For now, fetch some products as placeholder
            const products = await api.getProducts({ limit: 5 });
            setRecentlyViewedProducts(products.slice(0, 5));
        } catch (error) {
            console.error('Error loading recently viewed products:', error);
        }
    };

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            // Search products, brands, and categories in parallel
            const [products, allBrands, allCategories] = await Promise.all([
                api.getProducts({ search: query, limit: 100 }),
                api.getBrands(),
                api.getCategories()
            ]);

            setSearchResults(products);

            // Filter brands
            const filteredBrands = allBrands.filter(brand =>
                brand.name.toLowerCase().includes(query.toLowerCase())
            );
            setBrandResults(filteredBrands.slice(0, 5));

            // Filter categories
            const filteredCategories = allCategories.filter(category =>
                category.name.toLowerCase().includes(query.toLowerCase())
            );
            setCategoryResults(filteredCategories.slice(0, 5));

            // Save to recent searches only if query is meaningful
            if (query.trim().length > 2) {
                saveRecentSearch(query);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setBrandResults([]);
            setCategoryResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            // TODO: Save to AsyncStorage
            // Only update if the query is not already at the top
            if (recentSearches[0] !== query) {
                const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
                setRecentSearches(updated);
            }
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
            // TODO: Implement AsyncStorage
            setRecentSearches([]);
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
                        No results found for "{searchQuery}"
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
