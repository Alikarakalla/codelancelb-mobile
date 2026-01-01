import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { RevealingItem } from './RevealingItem';
import { SharedValue } from 'react-native-reanimated';
import { Category } from '@/types/schema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2; // (Screen - margin - gap) / 2

// Fallback Mock Data
const MOCK_CATEGORIES: Partial<Category>[] = [
    {
        id: 101,
        name: 'MEN',
        thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 102,
        name: 'WOMEN',
        thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 103,
        name: 'ACCESSORIES',
        thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 104,
        name: 'COLLECTIONS',
        thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
    }
];

interface Props {
    scrollY: SharedValue<number>;
    categories?: Category[];
}

export function PremiumCategoryGrid({ scrollY, categories }: Props) {
    // specific logic: use passed categories, or mock if empty
    const displayCategories = (categories && categories.length > 0) ? categories : MOCK_CATEGORIES as Category[];

    // Limit to 4 for the grid if needed, or allow more
    const gridItems = displayCategories.slice(0, 4);

    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <Text style={styles.titleText}>Shop by Category</Text>
            </View>
            <View style={styles.grid}>
                {gridItems.map((cat, index) => (
                    <Pressable key={cat.id} style={styles.card}>
                        <Image source={{ uri: cat.thumbnail || 'https://via.placeholder.com/300' }} style={styles.image} />
                        <View style={styles.overlay} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{cat.name}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 8,
    },
    headerArea: {
        marginBottom: 20,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#18181B',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: (SCREEN_WIDTH - 52) / 2, // (Screen - padding - gap) / 2
        height: ((SCREEN_WIDTH - 52) / 2) * 1.33,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 12,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f1f1f1',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    textContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});
