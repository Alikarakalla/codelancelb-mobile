import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, Platform, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { ShopFilterBar, FilterChip } from '@/components/shop/ShopFilterBar';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ShopSkeletonGrid } from '@/components/shop/ShopCardSkeleton';

import { Product, Category, Brand } from '@/types/schema';
import { api } from '@/services/apiClient';

import { useFilters } from '@/context/FilterContext';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const params = useLocalSearchParams();
    const { filters, setFilters, updateFilter, clearFilters } = useFilters();

    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);

    // Initial load: hydrate filters from URL params (deep links, refresh, home CTAs, etc.)
    // Handles both ID-based params (category_id / brand_id from prior writes) AND slug-based
    // params (category / brand / collection from CMS URLs routed via resolveInternalUrl).
    const hydratedScalarParams = React.useRef(false);
    React.useEffect(() => {
        if (hydratedScalarParams.current) return;
        const hasAny =
            params.category_id ||
            params.brand_id ||
            params.search ||
            params.sort ||
            params.color ||
            params.size ||
            params.price_min ||
            params.price_max;
        if (!hasAny) return;
        hydratedScalarParams.current = true;
        if (params.category_id) updateFilter('categoryIds', [Number(params.category_id)] as any);
        if (params.brand_id) updateFilter('brandIds', [Number(params.brand_id)] as any);
        if (params.search) updateFilter('searchQuery', String(params.search) as any);
        if (params.sort) updateFilter('sortInfo', String(params.sort) as any);
        if (params.color) updateFilter('color', String(params.color) as any);
        if (params.size) updateFilter('size', String(params.size) as any);
        const min = Number(params.price_min) || 0;
        const max = Number(params.price_max) || 1000;
        if (min > 0 || max < 1000) updateFilter('priceRange', [min, max] as any);
    }, [params.category_id, params.brand_id, params.search, params.sort, params.color, params.size, params.price_min, params.price_max, updateFilter]);

    // Slug-based filters need to wait until categories/brands are loaded so we can map slug → id.
    const hydratedSlugParams = React.useRef(false);
    React.useEffect(() => {
        if (hydratedSlugParams.current) return;
        const categorySlug = typeof params.category === 'string' ? params.category : null;
        const brandSlug = typeof params.brand === 'string' ? params.brand : null;
        const collectionSlug = typeof params.collection === 'string' ? params.collection : null;
        if (!categorySlug && !brandSlug && !collectionSlug) return;
        // Wait for the lookup data before trying to resolve slugs.
        if (categorySlug && categories.length === 0) return;
        if (brandSlug && brands.length === 0) return;
        hydratedSlugParams.current = true;

        const matchSlug = (val: string, slug: string) =>
            String(val || '').toLowerCase() === slug.toLowerCase();

        if (categorySlug) {
            let foundId: number | null = null;
            for (const cat of categories) {
                if (matchSlug((cat as any).slug || cat.name, categorySlug)) {
                    foundId = cat.id;
                    break;
                }
                for (const sub of cat.sub_categories || []) {
                    if (matchSlug((sub as any).slug || sub.name, categorySlug)) {
                        foundId = sub.id;
                        break;
                    }
                    for (const subsub of sub.sub_categories || []) {
                        if (matchSlug((subsub as any).slug || subsub.name, categorySlug)) {
                            foundId = subsub.id;
                            break;
                        }
                    }
                    if (foundId) break;
                }
                if (foundId) break;
            }
            if (foundId) updateFilter('categoryIds', [foundId] as any);
        }

        if (brandSlug) {
            const brand = brands.find(b => matchSlug((b as any).slug || b.name, brandSlug));
            if (brand) updateFilter('brandIds', [brand.id] as any);
        }

        if (collectionSlug) {
            // No native collection filter yet — use it as a search fallback so the
            // user still lands on a filtered grid instead of the full catalog.
            updateFilter('searchQuery', collectionSlug.replace(/[-_]/g, ' ') as any);
        }
    }, [params.category, params.brand, params.collection, categories, brands, updateFilter]);

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

    // Warm metadata cache early so Filter screen opens instantly without a blocking loader
    React.useEffect(() => {
        api.getFilterMetadata().catch(() => { });
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

    const handleSortSelect = React.useCallback((newSort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') => {
        updateFilter('sortInfo', newSort);
    }, [updateFilter]);

    const findCategoryPath = React.useCallback((catId: number): { name: string; trail: string[] } | null => {
        for (const cat of categories) {
            const catName = cat.name_en || cat.name;
            if (cat.id === catId) return { name: catName, trail: [catName] };
            if (cat.sub_categories) {
                for (const sub of cat.sub_categories) {
                    const subName = sub.name_en || sub.name;
                    if (sub.id === catId) return { name: subName, trail: [catName, subName] };
                    if (sub.sub_categories) {
                        for (const subsub of sub.sub_categories) {
                            const subsubName = subsub.name_en || subsub.name;
                            if (subsub.id === catId) {
                                return { name: subsubName, trail: [catName, subName, subsubName] };
                            }
                        }
                    }
                }
            }
        }
        return null;
    }, [categories]);

    const { shopPageTitle, breadcrumb, searchTerm } = React.useMemo(() => {
        const search = filters.searchQuery?.trim();
        if (search) {
            return { shopPageTitle: 'Search Results', breadcrumb: null, searchTerm: search };
        }
        if (filters.categoryIds.length === 1) {
            const path = findCategoryPath(filters.categoryIds[0]);
            if (path) {
                const trailWithoutLeaf = path.trail.slice(0, -1).join(' / ');
                return {
                    shopPageTitle: path.name,
                    breadcrumb: trailWithoutLeaf || null,
                    searchTerm: null,
                };
            }
        }
        if (filters.brandIds.length === 1) {
            const brand = brands.find(b => b.id === filters.brandIds[0]);
            if (brand) return { shopPageTitle: brand.name, breadcrumb: 'Brand', searchTerm: null };
        }
        return { shopPageTitle: 'All Products', breadcrumb: null, searchTerm: null };
    }, [filters.searchQuery, filters.categoryIds, filters.brandIds, brands, findCategoryPath]);

    // NOTE: removed URL persistence on every filter change. Expo Router's setParams
    // merges instead of replacing, so cleared filters used to leak back into the
    // URL and re-hydrate stale values on re-render. The one-shot hydration above
    // still covers deep links — that's all we need.

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

            } catch (error) {
                console.error('Error loading shop products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (filters.categoryIds.length > 0 && categories.length === 0) return;

        fetchProducts();

        // Depend on individual primitives so the effect re-runs on any filter change,
        // even if the FilterContext returned the same object reference.
    }, [
        filters.categoryIds,
        filters.brandIds,
        filters.priceRange,
        filters.searchQuery,
        filters.sortInfo,
        filters.color,
        filters.size,
        categories,
        brands,
    ]);

    // Derive the chip strip synchronously from current filters so the X tap clears
    // the chip immediately (no flash while waiting for the API).
    const activeFilters = React.useMemo<FilterChip[]>(() => {
        const chips: FilterChip[] = [];

        filters.categoryIds.forEach((id) => {
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
            chips.push({ id: `cat-${id}`, label: findName(id), type: 'category' });
        });

        filters.brandIds.forEach((id) => {
            const b = brands.find((br) => br.id === id);
            if (b) chips.push({ id: `brand-${id}`, label: b.name, type: 'brand' });
        });

        if (filters.color) chips.push({ id: 'filter-color', label: `Color: ${filters.color}`, type: 'color' });
        if (filters.size) chips.push({ id: 'filter-size', label: `Size: ${filters.size}`, type: 'size' });
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
            chips.push({
                id: 'filter-price',
                label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
                type: 'price',
            });
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

        return chips;
    }, [
        filters.categoryIds,
        filters.brandIds,
        filters.priceRange,
        filters.searchQuery,
        filters.sortInfo,
        filters.color,
        filters.size,
        categories,
        brands,
    ]);

    const handleRemoveFilter = React.useCallback((filterId: string) => {
        // Use setFilters with functional updates so we always operate on the latest
        // state — avoids the stale-closure bug where removing one chip would still
        // see an older `filters` object and leave the filter set.
        const parts = filterId.split('-');
        const type = parts[0];
        const idStr = parts.slice(1).join('-'); // handles 'filter-color' style ids too
        const id = Number(idStr);

        setFilters((prev) => {
            if (type === 'cat' && Number.isFinite(id)) {
                return { ...prev, categoryIds: prev.categoryIds.filter((c) => c !== id) };
            }
            if (type === 'brand' && Number.isFinite(id)) {
                return { ...prev, brandIds: prev.brandIds.filter((b) => b !== id) };
            }
            if (filterId === 'filter-color') return { ...prev, color: null };
            if (filterId === 'filter-size') return { ...prev, size: null };
            if (filterId === 'filter-price') return { ...prev, priceRange: [0, 1000] };
            if (filterId === 'search-query') return { ...prev, searchQuery: '' };
            if (filterId === 'sort-info') return { ...prev, sortInfo: 'newest' };
            return prev;
        });
    }, [setFilters]);

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
        <View collapsable={false} style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <GlobalHeader title="LUXE" />

            <View collapsable={false} style={{ flex: 1, paddingTop: 60 + insets.top }}>
                <ShopFilterBar
                    activeFilters={activeFilters}
                    onFilterPress={() => {
                        api.getFilterMetadata().catch(() => { });
                        router.push({
                            pathname: '/filter',
                            params: {}
                        });
                    }}
                    currentSort={filters.sortInfo}
                    onSortSelect={handleSortSelect}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={clearFilters}
                />

                {loading ? (
                    <ScrollView
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.listHeader}>
                            <View style={styles.resultTextPlaceholder} />
                        </View>
                        <ShopSkeletonGrid count={6} />
                    </ScrollView>
                ) : (
                    <ScrollView
                        collapsable={false}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.listContent}
                        onScroll={({ nativeEvent }) => {
                            const nearBottom =
                                nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
                                nativeEvent.contentSize.height - 260;
                            if (nearBottom) {
                                loadMore();
                            }
                        }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={isDark ? "#fff" : "#18181B"} />
                        }
                    >
                        <View style={styles.listHeader}>
                            <View style={styles.titleRow}>
                                <Text
                                    style={[styles.pageTitle, isDark && { color: '#F8FAFC' }]}
                                    numberOfLines={1}
                                >
                                    {shopPageTitle}
                                </Text>
                                <Text style={[styles.pageCount, isDark && { color: '#64748B' }]}>
                                    ({products.length})
                                </Text>
                            </View>
                            {breadcrumb ? (
                                <Text style={[styles.breadcrumb, isDark && { color: '#64748B' }]} numberOfLines={1}>
                                    {breadcrumb}
                                </Text>
                            ) : null}
                            {searchTerm ? (
                                <Text style={[styles.searchHint, isDark && { color: '#64748B' }]} numberOfLines={1}>
                                    Showing results for{' '}
                                    <Text style={[styles.searchTerm, isDark && { color: '#F8FAFC' }]}>
                                        "{searchTerm}"
                                    </Text>
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.grid}>
                            {products.map((item, idx) => (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInDown.delay(Math.min(idx, 8) * 45).duration(420)}
                                    style={{ width: Platform.OS === 'ios' && Platform.isPad ? '32%' : '48%' }}
                                >
                                    <ShopProductCard product={item} />
                                </Animated.View>
                            ))}
                        </View>

                        {loadingMore ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={isDark ? "#fff" : "#18181B"} />
                            </View>
                        ) : <View style={{ height: 40 }} />}
                    </ScrollView>
                )}
            </View>

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
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
        flexShrink: 1,
    },
    pageCount: {
        fontSize: 15,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    breadcrumb: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    searchHint: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    searchTerm: {
        fontWeight: '700',
        color: '#0F172A',
    },
    resultText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
    },
    resultTextPlaceholder: {
        height: 14,
        width: 140,
        borderRadius: 4,
        backgroundColor: '#E8E8E8',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
