import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { SearchCustomIcon } from '@/components/ui/icons';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { api } from '@/services/apiClient';
import { Product, Brand, Category } from '@/types/schema';
import { useRouter } from 'expo-router';

interface SearchBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchBottomSheet({ isOpen, onClose }: SearchBottomSheetProps) {
    const actionSheetRef = useRef<any>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [brandResults, setBrandResults] = useState<Brand[]>([]);
    const [categoryResults, setCategoryResults] = useState<Category[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            actionSheetRef.current?.show();
            loadRecentSearches();
            loadTrendingSearches();
            loadRecentlyViewedProducts();
        } else {
            actionSheetRef.current?.hide();
        }
    }, [isOpen]);

    // Load recent searches from storage
    const loadRecentSearches = async () => {
        try {
            // TODO: Load from AsyncStorage
            // setRecentSearches(['Nike Air Max', 'Summer Dress', 'Leather Jacket', 'Running Shoes']);
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    // Load trending searches from API
    const loadTrendingSearches = async () => {
        try {
            // TODO: Implement trending searches API endpoint
            setTrendingSearches(['Winter Collection', 'Designer Bags', 'Sneakers', 'Watches']);
        } catch (error) {
            console.error('Error loading trending searches:', error);
        }
    };

    // Load recently viewed products
    const loadRecentlyViewedProducts = async () => {
        try {
            // TODO: Load from AsyncStorage or API
            // For now, fetch some products as placeholder
            const products = await api.getProducts({ limit: 5 });
            setRecentlyViewedProducts(products.slice(0, 5));
        } catch (error) {
            console.error('Error loading recently viewed products:', error);
        }
    };

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

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            // Search products, brands, and categories in parallel
            const [allProducts, allBrands, allCategories] = await Promise.all([
                api.getProducts(),
                api.getBrands(),
                api.getCategories()
            ]);

            // Filter products
            const filteredProducts = allProducts.filter(product => {
                const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || '';
                return product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.description?.toLowerCase().includes(query.toLowerCase()) ||
                    brandName.toLowerCase().includes(query.toLowerCase());
            });
            setSearchResults(filteredProducts.slice(0, 10));

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

            // Save to recent searches
            saveRecentSearch(query);
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
            const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
            setRecentSearches(updated);
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const handleProductPress = (productId: number) => {
        onClose();
        router.push(`/product/${productId}`);
    };

    const handleBrandPress = (brandId: number) => {
        onClose();
        // Navigate to shop with brand filter
        router.push(`/(tabs)/shop?brand_id=${brandId}`);
    };

    const handleCategoryPress = (categoryId: number) => {
        onClose();
        // Navigate to shop with category filter
        router.push(`/(tabs)/shop?category_id=${categoryId}`);
    };

    const handleRecentSearch = (query: string) => {
        setSearchQuery(query);
    };

    const clearRecentSearches = async () => {
        try {
            // TODO: Clear from AsyncStorage
            setRecentSearches([]);
        } catch (error) {
            console.error('Error clearing recent searches:', error);
        }
    };

    // Helper to calculate discount percentage
    const calculateDiscount = (product: Product): number | null => {
        if (product.discount_amount && product.discount_type) {
            if (product.discount_type === 'percent') {
                return product.discount_amount;
            } else if (product.discount_type === 'fixed' && product.price) {
                return Math.round((product.discount_amount / product.price) * 100);
            }
        }
        if (product.compare_at_price && product.price && product.compare_at_price > product.price) {
            return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
        }
        return null;
    };

    // Helper to get final price
    const getFinalPrice = (product: Product): number => {
        if (!product.price) return 0;
        if (product.discount_amount && product.discount_type === 'fixed') {
            return Math.max(0, product.price - product.discount_amount);
        }
        return product.price;
    };

    const hasResults = searchResults.length > 0 || brandResults.length > 0 || categoryResults.length > 0;

    return (
        <ActionSheet
            ref={actionSheetRef}
            containerStyle={[
                styles.container,
                isDark && styles.containerDark
            ]}
            indicatorStyle={[
                styles.indicator,
                isDark && styles.indicatorDark
            ]}
            gestureEnabled
            onClose={onClose}
            defaultOverlayOpacity={0.5}
        >
            <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                        Search Products
                    </Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                </View>

                {/* Search Input */}
                <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
                    <HugeiconsIcon icon={SearchCustomIcon} size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <TextInput
                        style={[styles.searchInput, isDark && styles.searchInputDark]}
                        placeholder="Search for products..."
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Feather name="x-circle" size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
                        </Pressable>
                    )}
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Search Results */}
                    {searchQuery.length > 2 && (
                        <>
                            {isSearching ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#000" />
                                </View>
                            ) : hasResults ? (
                                <>
                                    {/* Brands Section */}
                                    {brandResults.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                                Brands ({brandResults.length})
                                            </Text>
                                            {brandResults.map((brand) => (
                                                <Pressable
                                                    key={brand.id}
                                                    style={[styles.listItem, isDark && styles.listItemDark]}
                                                    onPress={() => handleBrandPress(brand.id)}
                                                >
                                                    <Feather name="tag" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                                                    <Text style={[styles.listItemText, isDark && styles.listItemTextDark]}>
                                                        {brand.name}
                                                    </Text>
                                                    <Feather name="chevron-right" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}

                                    {/* Categories Section */}
                                    {categoryResults.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                                Categories ({categoryResults.length})
                                            </Text>
                                            {categoryResults.map((category) => (
                                                <Pressable
                                                    key={category.id}
                                                    style={[styles.listItem, isDark && styles.listItemDark]}
                                                    onPress={() => handleCategoryPress(category.id)}
                                                >
                                                    <Feather name="folder" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                                                    <Text style={[styles.listItemText, isDark && styles.listItemTextDark]}>
                                                        {category.name}
                                                    </Text>
                                                    <Feather name="chevron-right" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}

                                    {/* Products Section */}
                                    {searchResults.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                                Results ({searchResults.length})
                                            </Text>
                                            {searchResults.map((product) => (
                                                <Pressable
                                                    key={product.id}
                                                    style={[styles.productItem, isDark && styles.productItemDark]}
                                                    onPress={() => handleProductPress(product.id)}
                                                >
                                                    <View style={styles.productImageContainer}>
                                                        <Image
                                                            source={{ uri: product.images?.[0]?.path || product.main_image || '' }}
                                                            style={styles.productImage}
                                                            contentFit="cover"
                                                        />
                                                        {calculateDiscount(product) && (
                                                            <View style={styles.discountBadge}>
                                                                <Text style={styles.discountText}>
                                                                    -{calculateDiscount(product)}%
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View style={styles.productInfo}>
                                                        <Text style={[styles.productBrand, isDark && styles.productBrandDark]}>
                                                            {typeof product.brand === 'string' ? product.brand : product.brand?.name || ''}
                                                        </Text>
                                                        <Text
                                                            style={[styles.productName, isDark && styles.productNameDark]}
                                                            numberOfLines={2}
                                                        >
                                                            {product.name}
                                                        </Text>
                                                        <View style={styles.priceContainer}>
                                                            {calculateDiscount(product) ? (
                                                                <>
                                                                    <Text style={[styles.productPrice, isDark && styles.productPriceDark]}>
                                                                        ${getFinalPrice(product).toFixed(2)}
                                                                    </Text>
                                                                    <Text style={styles.originalPrice}>
                                                                        ${product.price?.toFixed(2)}
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                <Text style={[styles.productPrice, isDark && styles.productPriceDark]}>
                                                                    ${product.price?.toFixed(2)}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                    <Feather name="chevron-right" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                                        No results found for "{searchQuery}"
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Recent & Trending Searches */}
                    {searchQuery.length === 0 && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
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
                                                <Feather name="clock" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                                                <Text style={[styles.chipText, isDark && styles.chipTextDark]}>{item}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Trending Searches */}
                            {trendingSearches.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                        Trending Now
                                    </Text>
                                    <View style={styles.chipContainer}>
                                        {trendingSearches.map((item, index) => (
                                            <Pressable
                                                key={index}
                                                style={[styles.chip, styles.trendingChip, isDark && styles.chipDark]}
                                                onPress={() => handleRecentSearch(item)}
                                            >
                                                <Feather name="trending-up" size={14} color="#000" />
                                                <Text style={[styles.chipText, isDark && styles.chipTextDark]}>{item}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Recently Viewed Products */}
                            {recentlyViewedProducts.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                        Recently Viewed
                                    </Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.horizontalScroll}
                                    >
                                        {recentlyViewedProducts.map((product) => (
                                            <Pressable
                                                key={product.id}
                                                style={[styles.recentProductCard, isDark && styles.recentProductCardDark]}
                                                onPress={() => handleProductPress(product.id)}
                                            >
                                                <View style={styles.recentImageContainer}>
                                                    <Image
                                                        source={{ uri: product.images?.[0]?.path || product.main_image || '' }}
                                                        style={styles.recentProductImage}
                                                        contentFit="cover"
                                                    />
                                                    {calculateDiscount(product) && (
                                                        <View style={styles.discountBadge}>
                                                            <Text style={styles.discountText}>
                                                                -{calculateDiscount(product)}%
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.recentProductInfo}>
                                                    <Text
                                                        style={[styles.recentProductName, isDark && styles.recentProductNameDark]}
                                                        numberOfLines={2}
                                                    >
                                                        {product.name}
                                                    </Text>
                                                    {calculateDiscount(product) ? (
                                                        <View style={styles.recentPriceContainer}>
                                                            <Text style={[styles.recentProductPrice, isDark && styles.recentProductPriceDark]}>
                                                                ${getFinalPrice(product).toFixed(2)}
                                                            </Text>
                                                            <Text style={styles.recentOriginalPrice}>
                                                                ${product.price?.toFixed(2)}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <Text style={[styles.recentProductPrice, isDark && styles.recentProductPriceDark]}>
                                                            ${product.price?.toFixed(2)}
                                                        </Text>
                                                    )}
                                                </View>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>
        </ActionSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 0,
        height: '80%',
    },
    containerDark: {
        backgroundColor: '#1a2230',
    },
    indicator: {
        backgroundColor: '#e5e7eb',
        width: 40,
        height: 4,
    },
    indicatorDark: {
        backgroundColor: '#374151',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111318',
    },
    headerTitleDark: {
        color: '#fff',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 24,
        gap: 12,
    },
    searchContainerDark: {
        backgroundColor: '#101622',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111318',
    },
    searchInputDark: {
        color: '#fff',
    },
    clearButton: {
        padding: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111318',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#fff',
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chipDark: {
        backgroundColor: '#101622',
        borderColor: '#374151',
    },
    trendingChip: {
        backgroundColor: '#f8fafc',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    chipTextDark: {
        color: '#9ca3af',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    productItemDark: {
        backgroundColor: '#101622',
    },
    productImageContainer: {
        position: 'relative',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    discountBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#ef4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    productInfo: {
        flex: 1,
        gap: 2,
    },
    productBrand: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    productBrandDark: {
        color: '#9ca3af',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111318',
    },
    productNameDark: {
        color: '#fff',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    productPriceDark: {
        color: '#fff',
    },
    originalPrice: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    emptyTextDark: {
        color: '#9ca3af',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    listItemDark: {
        backgroundColor: '#101622',
    },
    listItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#111318',
    },
    listItemTextDark: {
        color: '#fff',
    },
    horizontalScroll: {
        gap: 12,
        paddingRight: 20,
    },
    recentProductCard: {
        width: 140,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        overflow: 'hidden',
    },
    recentProductCardDark: {
        backgroundColor: '#101622',
    },
    recentImageContainer: {
        position: 'relative',
    },
    recentProductImage: {
        width: 140,
        height: 140,
    },
    recentProductInfo: {
        padding: 8,
        gap: 4,
    },
    recentProductName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111318',
        lineHeight: 16,
    },
    recentProductNameDark: {
        color: '#fff',
    },
    recentPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
    },
    recentProductPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    recentProductPriceDark: {
        color: '#fff',
    },
    recentOriginalPrice: {
        fontSize: 11,
        fontWeight: '500',
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
});
