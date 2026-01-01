import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Product } from '@/types/schema';
import { ProductGridItem } from '@/components/product/ProductGridItem';

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
                    <ProductGridItem
                        product={item}
                        width={200}
                        onPress={() => onProductPress(item)}
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
