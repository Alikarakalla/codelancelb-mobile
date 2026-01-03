import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Updated import

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { ShopFilterBar, FilterChip } from '@/components/shop/ShopFilterBar';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { ShopFilterModal } from '@/components/shop/ShopFilterModal';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { Product, Category, Brand } from '@/types/schema';
import { useDrawer } from '@/hooks/use-drawer-context';
import { api } from '@/services/apiClient';
import { MOCK_CATEGORIES, MOCK_BRANDS } from '@/constants/mockData';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { category_id, brand_id } = useLocalSearchParams();
    const { openDrawer } = useDrawer();
    const [filterVisible, setFilterVisible] = React.useState(false);
    const [activeFilters, setActiveFilters] = React.useState<FilterChip[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

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

    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (category_id) params.category_id = Number(category_id);
                if (brand_id) params.brand_id = Number(brand_id);

                const data = await api.getProducts(params);
                setProducts(data);

                // Sync active filters for chips
                let newFilters: FilterChip[] = [];
                if (category_id) {
                    const cat = categories.find(c => c.id === Number(category_id));
                    if (cat) newFilters.push({ id: cat.id.toString(), label: cat.name, type: 'category' });
                }
                if (brand_id) {
                    const brand = brands.find(b => b.id === Number(brand_id));
                    if (brand) newFilters.push({ id: brand.id.toString(), label: brand.name, type: 'brand' });
                }
                setActiveFilters(newFilters);

            } catch (error) {
                console.error('Error loading shop products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category_id, brand_id, categories, brands]);

    const handleApplyFilters = async (filters: any) => {
        setFilterVisible(false);
        setLoading(true);
        try {
            // Update UI chips
            let newFilters: FilterChip[] = [];

            if (filters.category_ids?.length) {
                filters.category_ids.forEach((id: number) => {
                    const cat = categories.find(c => c.id === id);
                    if (cat) newFilters.push({ id: `cat-${id}`, label: cat.name, type: 'category' });
                });
            }
            if (filters.brand_ids?.length) {
                filters.brand_ids.forEach((id: number) => {
                    const brand = brands.find(b => b.id === id);
                    if (brand) newFilters.push({ id: `brand-${id}`, label: brand.name, type: 'brand' });
                });
            }
            if (filters.priceRange) {
                newFilters.push({ id: 'price', label: `$${filters.priceRange.min}-$${filters.priceRange.max}`, type: 'price' });
            }

            setActiveFilters(newFilters);

            // Fetch with multi-ids
            const data = await api.getProducts({
                category_ids: filters.category_ids,
                brand_ids: filters.brand_ids,
                // price logic pending if API supports it, or filter client-side
            });
            setProducts(data);
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFilter = (filterId: string) => {
        // Clear param if needed or just re-apply based on remaining chips
        const newActive = activeFilters.filter(f => f.id !== filterId);
        setActiveFilters(newActive);

        // Re-fetch logic
        const fetchFilters = async () => {
            setLoading(true);
            const catIds = newActive.filter(f => f.type === 'category').map(f => Number(f.id.split('-')[1]));
            const brandIds = newActive.filter(f => f.type === 'brand').map(f => Number(f.id.split('-')[1]));
            const data = await api.getProducts({ category_ids: catIds, brand_ids: brandIds });
            setProducts(data);
            setLoading(false);
        };
        fetchFilters();
    };

    const handleProductPress = (product: Product) => {
        router.push({
            pathname: `/product/${product.id}`,
            params: { initialImage: product.main_image }
        });
    };

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <GlobalHeader title="LUXE" />

            <View style={{ flex: 1, paddingTop: 60 + insets.top }}>
                <ShopFilterBar
                    activeFilters={activeFilters}
                    onFilterPress={() => setFilterVisible(true)}
                    onSortPress={() => { }}
                    onRemoveFilter={handleRemoveFilter}
                />

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={isDark ? "#fff" : "#18181B"} />
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <ShopProductCard
                                product={item}
                                style={{ width: '48%' }}
                                onQuickView={() => setQuickViewProduct(item)}
                            />
                        )}
                        ListHeaderComponent={() => (
                            <View style={styles.listHeader}>
                                <Text style={[styles.resultText, isDark && { color: '#94A3B8' }]}>Showing {products.length} results</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
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

            <ShopFilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={handleApplyFilters}
                categories={categories}
                brands={brands}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F8',
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
