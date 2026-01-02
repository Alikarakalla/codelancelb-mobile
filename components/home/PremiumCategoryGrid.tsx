import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { RevealingItem } from './RevealingItem';
import { SharedValue } from 'react-native-reanimated';
import { Category } from '@/types/schema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2; // (Screen - margin - gap) / 2

import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
    scrollY: SharedValue<number>;
    categories?: Category[];
}

export function PremiumCategoryGrid({ scrollY, categories }: Props) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // specific logic: use passed categories, or empty if none (index.tsx handles fallback)
    const displayCategories = categories || [];

    // Limit to 4 for the grid
    const gridItems = displayCategories.slice(0, 4);

    const handleCategoryPress = (cat: Category) => {
        router.push({
            pathname: '/shop',
            params: { category_id: cat.id }
        });
    };

    if (displayCategories.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <Text style={[styles.titleText, isDark && { color: '#fff' }]}>Shop by Category</Text>
            </View>
            <View style={styles.grid}>
                {gridItems.map((cat, index) => (
                    <Pressable
                        key={cat.id}
                        style={styles.card}
                        onPress={() => handleCategoryPress(cat)}
                    >
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
