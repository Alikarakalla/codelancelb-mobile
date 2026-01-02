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
import { Product } from '@/types/schema';
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
    const [loading, setLoading] = React.useState(true);
    const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = {};
                let newFilters: FilterChip[] = [];

                if (category_id) {
                    params.category_id = Number(category_id);
                    const cat = MOCK_CATEGORIES.find(c => c.id === Number(category_id));
                    if (cat) {
                        newFilters.push({ id: cat.id.toString(), label: cat.name, type: 'category' });
                    }
                }

                if (brand_id) {
                    params.brand_id = Number(brand_id);
                    const brand = MOCK_BRANDS.find(b => b.id === Number(brand_id));
                    if (brand) {
                        newFilters.push({ id: brand.id.toString(), label: brand.name, type: 'brand' });
                    }
                }

                setActiveFilters(newFilters);

                const data = await api.getProducts(params);
                setProducts(data);
            } catch (error) {
                console.error('Error loading shop products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category_id, brand_id]);

    const handleApplyFilters = (filters: any) => {
        console.log('Applied filters:', filters);
        setFilterVisible(false);
    };

    const handleRemoveFilter = (filterId: string) => {
        const removedFilter = activeFilters.find(f => f.id === filterId);
        setActiveFilters(prev => prev.filter(f => f.id !== filterId));

        if (removedFilter?.type === 'category') {
            // Re-fetch all products if category filter is cleared
            const fetchAll = async () => {
                setLoading(true);
                try {
                    const data = await api.getProducts();
                    setProducts(data);
                } catch (error) {
                    console.error('Error re-fetching all products:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAll();
        }
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
