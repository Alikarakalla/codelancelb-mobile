import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { ShopFilterBar, FilterChip } from '@/components/shop/ShopFilterBar';
import { ProductGridItem } from '@/components/product/ProductGridItem';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { ShopFilterModal } from '@/components/shop/ShopFilterModal';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { Product } from '@/types/schema';
import { Ionicons } from '@expo/vector-icons';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
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
        // In a real app, this would be an API call:
        // const filtered = await apiClient.getProducts(filters);
        // setProducts(filtered);
        setFilterVisible(false);
    };

    const handleRemoveFilter = (filterId: string) => {
        setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    };

    const handleProductPress = (product: Product) => {
        console.log('Product pressed:', product.name);
        // router.push(`/product/${product.slug}`);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LuxeHeader showBackButton={false} title="Shop All" />

            {/* Content Area */}
            <View style={{ flex: 1, paddingTop: 60 + insets.top }}>
                {/* Filter Bar */}
                <ShopFilterBar
                    activeFilters={activeFilters}
                    onFilterPress={() => setFilterVisible(true)}
                    onSortPress={() => { }}
                    onRemoveFilter={handleRemoveFilter}
                />

                {/* Main List */}
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <ProductGridItem
                            product={item}
                            onPress={() => handleProductPress(item)}
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

            {/* Quick View Modal */}
            <ProductQuickViewModal
                visible={!!quickViewProduct}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={(params) => console.log('Add to cart:', params)}
                onViewDetails={(product) => handleProductPress(product)}
            />

            {/* Filter Modal */}
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
        backgroundColor: '#F6F6F8', // background-light
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
