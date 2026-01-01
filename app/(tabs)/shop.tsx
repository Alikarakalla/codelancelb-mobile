import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { ShopFilterBar, FilterChip } from '@/components/shop/ShopFilterBar';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { ShopFilterModal } from '@/components/shop/ShopFilterModal';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { Product } from '@/types/schema';
import { useDrawer } from '@/hooks/use-drawer-context';
import { Ionicons } from '@expo/vector-icons';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const { openDrawer } = useDrawer();
    const [filterVisible, setFilterVisible] = React.useState(false);
    const [activeFilters, setActiveFilters] = React.useState<FilterChip[]>([
        { id: '1', label: 'Jeans & Denim', type: 'category' },
        { id: '2', label: 'Black', type: 'color' },
        { id: '3', label: '$45 - $120', type: 'price' },
    ]);
    const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
    const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

    const handleApplyFilters = (filters: any) => {
        console.log('Applied filters:', filters);
        setFilterVisible(false);
    };

    const handleRemoveFilter = (filterId: string) => {
        setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    };

    const handleProductPress = (product: Product) => {
        console.log('Product pressed:', product.name);
    };

    return (
        <View style={styles.container}>
            <LuxeHeader
                showBackButton={false}
                title="LUXE"
                onOpenMenu={openDrawer}
            />

            <View style={{ flex: 1, paddingTop: 60 + insets.top }}>
                <ShopFilterBar
                    activeFilters={activeFilters}
                    onFilterPress={() => setFilterVisible(true)}
                    onSortPress={() => { }}
                    onRemoveFilter={handleRemoveFilter}
                />

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
                            <Text style={styles.resultText}>Showing {products.length} results</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
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
    }
});
