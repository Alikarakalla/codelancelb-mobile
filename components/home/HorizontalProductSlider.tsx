import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Product } from '@/types/schema';
import { ShopProductCard } from '@/components/shop/ShopProductCard';

interface HorizontalProductSliderProps {
    products: Product[];
    onProductPress: (product: Product) => void;
}

export function HorizontalProductSlider({ products, onProductPress }: HorizontalProductSliderProps) {
    return (
        <FlatList
            data={products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
            snapToInterval={200 + 16} // item width + gap
            decelerationRate="fast"
            renderItem={({ item }) => (
                <View style={styles.itemWrapper}>
                    <ShopProductCard
                        product={item}
                    // style={{ width: '100%' }} // Implicitly fills wrapper
                    />
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    itemWrapper: {
        width: 200,
        marginRight: 16,
    }
});
