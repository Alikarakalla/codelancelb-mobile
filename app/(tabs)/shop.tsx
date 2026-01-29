import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ActionSheetIOS, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { ShopFilterBar, FilterChip } from '@/components/shop/ShopFilterBar';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';

import { Product, Category, Brand } from '@/types/schema';
import { api } from '@/services/apiClient';

import { useFilters } from '@/context/FilterContext';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const params = useLocalSearchParams();
    const { filters, updateFilter, setFilters } = useFilters();

    const [activeFilters, setActiveFilters] = React.useState<FilterChip[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);

    // Initial load: Sync URL params to Context if provided
    React.useEffect(() => {
        if (params.category_id || params.brand_id || params.search) {
            const newFilters: any = {};
            if (params.category_id) newFilters.categoryIds = [Number(params.category_id)];
            if (params.brand_id) newFilters.brandIds = [Number(params.brand_id)];
            if (params.search) newFilters.searchQuery = String(params.search);
            Object.entries(newFilters).forEach(([k, v]) => updateFilter(k as any, v));
        }
    }, [params.category_id, params.brand_id, params.search]);

    React.useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [cats, brs] = await Promise.all([
                    api.getCategories(),
                    api.getBrands()
                ]);
                setCategories(cats);
                setBrands(brs);
            } catch (err) {
                console.warn('Error loading filters:', err);
            }
        };
        fetchFilters();
    }, []);

    // Helper to classify Category IDs
    const classifyCategoryIds = (ids: number[], allCategories: Category[]) => {
        const category_ids: number[] = [];
        const sub_category_ids: number[] = [];
        const sub_sub_category_ids: number[] = [];

        const findCategory = (id: number): 'top' | 'sub' | 'subsub' | null => {
            for (const cat of allCategories) {
                if (cat.id === id) return 'top';
                if (cat.sub_categories) {
                    for (const sub of cat.sub_categories) {
                        if (sub.id === id) return 'sub';
                        if (sub.sub_categories) {
                            for (const subsub of sub.sub_categories) {
                                if (subsub.id === id) return 'subsub';
                            }
                        }
                    }
                }
            }
            return null;
        };

        ids.forEach(id => {
            const type = findCategory(id);
            if (type === 'top') category_ids.push(id);
            else if (type === 'sub') sub_category_ids.push(id);
            else if (type === 'subsub') sub_sub_category_ids.push(id);
            else category_ids.push(id);
        });

        return { category_ids, sub_category_ids, sub_sub_category_ids };
    };

    // Sorting Helper
    const parseSortInfo = (info: string) => {
        if (!info) return {};
        switch (info) {
            case 'price_asc': return { sort_by: 'price', sort_order: 'asc' };
            case 'price_desc': return { sort_by: 'price', sort_order: 'desc' };
            case 'name_asc': return { sort_by: 'name', sort_order: 'asc' };
            case 'name_desc': return { sort_by: 'name', sort_order: 'desc' };
            case 'newest': return { sort_by: 'created_at', sort_order: 'desc' };
            default: return { sort_by: 'created_at', sort_order: 'desc' };
        }
    };

    const handleSortPress = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z', 'Name: Z to A'],
                cancelButtonIndex: 0,
                userInterfaceStyle: isDark ? 'dark' : 'light',
                title: 'Sort Products',
                message: 'Choose a sorting option'
            },
            buttonIndex => {
                if (buttonIndex === 0) return; // Cancel
                let newSort = 'newest';
                if (buttonIndex === 1) newSort = 'newest';
                if (buttonIndex === 2) newSort = 'price_asc';
                if (buttonIndex === 3) newSort = 'price_desc';
                if (buttonIndex === 4) newSort = 'name_asc';
                if (buttonIndex === 5) newSort = 'name_desc';

                updateFilter('sortInfo', newSort);
            }
        );
    };

    // Main Product Fetch Effect
    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { category_ids, sub_category_ids, sub_sub_category_ids } = classifyCategoryIds(filters.categoryIds, categories);
                const sortParams = parseSortInfo(filters.sortInfo);

                const apiParams: any = {
                    limit: 12,
                    page: 1,
                    category_ids,
                    sub_category_ids,
                    sub_sub_category_ids,
                    brand_ids: filters.brandIds,
                    min_price: filters.priceRange[0],
                    max_price: filters.priceRange[1],
                    color: filters.color,
                    size: filters.size,
                    search: filters.searchQuery,
                    ...sortParams
                };

                const data = await api.getProducts(apiParams);
                setProducts(data);
                setHasMore(data.length >= 12);
                setPage(1);

                // Update UI Chips
                let chips: FilterChip[] = [];

                filters.categoryIds.forEach(id => {
                    const findName = (catId: number): string => {
                        for (const cat of categories) {
                            if (cat.id === catId) return cat.name_en || cat.name;
                            if (cat.sub_categories) {
                                for (const sub of cat.sub_categories) {
                                    if (sub.id === catId) return sub.name_en || sub.name;
                                    if (sub.sub_categories) {
                                        for (const subsub of sub.sub_categories) {
                                            if (subsub.id === catId) return subsub.name_en || subsub.name;
                                        }
                                    }
                                }
                            }
                        }
                        return 'Category';
                    };
                    const name = findName(id);
                    chips.push({ id: `cat-${id}`, label: name, type: 'category' });
                });

                filters.brandIds.forEach(id => {
                    const b = brands.find(br => br.id === id);
                    if (b) chips.push({ id: `brand-${id}`, label: b.name, type: 'brand' });
                });

                if (filters.color) chips.push({ id: 'filter-color', label: `Color: ${filters.color}`, type: 'color' });
                if (filters.size) chips.push({ id: 'filter-size', label: `Size: ${filters.size}`, type: 'size' });
                if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
                    chips.push({ id: 'filter-price', label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`, type: 'price' });
                }
                if (filters.searchQuery) chips.push({ id: 'search-query', label: `Search: ${filters.searchQuery}`, type: 'search' });

                if (filters.sortInfo && filters.sortInfo !== 'newest') {
                    let label = 'Sort: Newest';
                    if (filters.sortInfo === 'price_asc') label = 'Sort: Price Low to High';
                    if (filters.sortInfo === 'price_desc') label = 'Sort: Price High to Low';
                    if (filters.sortInfo === 'name_asc') label = 'Sort: Name A-Z';
                    if (filters.sortInfo === 'name_desc') label = 'Sort: Name Z-A';
                    chips.push({ id: 'sort-info', label, type: 'sort' });
                }

                setActiveFilters(chips);

            } catch (error) {
                console.error('Error loading shop products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (filters.categoryIds.length > 0 && categories.length === 0) return;

        fetchProducts();

    }, [filters, categories, brands]);

    const handleRemoveFilter = (filterId: string) => {
        const type = filterId.split('-')[0];
        const id = Number(filterId.split('-')[1]);

        if (type === 'cat') {
            updateFilter('categoryIds', filters.categoryIds.filter(c => c !== id));
        } else if (type === 'brand') {
            updateFilter('brandIds', filters.brandIds.filter(b => b !== id));
        } else if (type === 'color' || filterId === 'filter-color') updateFilter('color', null);
        else if (type === 'size' || filterId === 'filter-size') updateFilter('size', null);
        else if (type === 'price' || filterId === 'filter-price') updateFilter('priceRange', [0, 1000]);
        else if (type === 'search' || filterId === 'search-query') updateFilter('searchQuery', '');
        else if (type === 'sort' || filterId === 'sort-info') updateFilter('sortInfo', 'newest');
    };

    const handleProductPress = (product: Product) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: product.id, initialImage: product.main_image || '' }
        });
    };

    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const { category_ids, sub_category_ids, sub_sub_category_ids } = classifyCategoryIds(filters.categoryIds, categories);
            const sortParams = parseSortInfo(filters.sortInfo);

            const apiParams: any = {
                limit: 12,
                page: 1,
                category_ids,
                sub_category_ids,
                sub_sub_category_ids,
                brand_ids: filters.brandIds,
                min_price: filters.priceRange[0],
                max_price: filters.priceRange[1],
                color: filters.color,
                size: filters.size,
                search: filters.searchQuery,
                ...sortParams
            };
            const data = await api.getProducts(apiParams);
            setProducts(data);
            setHasMore(data.length >= 12);
            setPage(1);
        } catch (error) {
            console.error('Error refreshing shop:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const loadMore = async () => {
        if (loading || loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const { category_ids, sub_category_ids, sub_sub_category_ids } = classifyCategoryIds(filters.categoryIds, categories);
            const sortParams = parseSortInfo(filters.sortInfo);

            const apiParams: any = {
                limit: 12,
                page: nextPage,
                category_ids,
                sub_category_ids,
                sub_sub_category_ids,
                brand_ids: filters.brandIds,
                min_price: filters.priceRange[0],
                max_price: filters.priceRange[1],
                color: filters.color,
                size: filters.size,
                search: filters.searchQuery,
                ...sortParams
            };
            const data = await api.getProducts(apiParams);
            if (data.length > 0) {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProducts = data.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newProducts];
                });
                setPage(nextPage);
            }
            setHasMore(data.length >= 12);
        } catch (error) {
            console.error('Error loading more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <GlobalHeader title="LUXE" />

            <View style={{ flex: 1, paddingTop: 60 + insets.top }}>
                <ShopFilterBar
                    activeFilters={activeFilters}
                    onFilterPress={() => router.push({
                        pathname: '/filter',
                        params: {}
                    })}
                    onSortPress={handleSortPress}
                    onRemoveFilter={handleRemoveFilter}
                />

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={isDark ? "#fff" : "#18181B"} />
                    </View>
                ) : (
                    <FlatList
                        key={Platform.OS === 'ios' && Platform.isPad ? 3 : 2}
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={Platform.OS === 'ios' && Platform.isPad ? 3 : 2}
                        renderItem={({ item }) => (
                            <ShopProductCard
                                product={item}
                                style={{ width: Platform.OS === 'ios' && Platform.isPad ? '32%' : '48%' }}
                                onQuickView={() => setQuickViewProduct(item)}
                            />
                        )}
                        ListHeaderComponent={() => (
                            <View style={styles.listHeader}>
                                <Text style={[styles.resultText, isDark && { color: '#94A3B8' }]}>Showing {products.length} results</Text>
                            </View>
                        )}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={isDark ? "#fff" : "#18181B"} />
                                </View>
                            ) : <View style={{ height: 40 }} />
                        }
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={isDark ? "#fff" : "#18181B"} />
                        }
                    />
                )}
            </View>

            <ProductQuickViewModal
                visible={!!quickViewProduct}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={(params) => console.log('Add to cart:', params)}
                onViewDetails={(product) => handleProductPress(product)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    listHeader: {
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    resultText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
