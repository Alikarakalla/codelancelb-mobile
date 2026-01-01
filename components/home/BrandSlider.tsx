import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;

import { SharedValue } from 'react-native-reanimated';
import { RevealingItem } from './RevealingItem';
import { Brand } from '@/types/schema';

const MOCK_BRANDS = [
    { id: 1, name: 'LATTAFA', name_en: 'LATTAFA', name_ar: 'لطافة', slug: 'lattafa', logo: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', is_active: true },
    { id: 2, name: 'MAYBELLINE', name_en: 'MAYBELLINE', name_ar: 'ميبيلين', slug: 'maybelline', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop', is_active: true },
    { id: 3, name: 'YSL', name_en: 'YVES SAINT LAURENT', name_ar: 'YSL', slug: 'ysl', logo: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop', is_active: true },
    { id: 4, name: 'BOURJOIS', name_en: 'BOURJOIS', name_ar: 'بورجوا', slug: 'bourjois', logo: 'https://images.unsplash.com/photo-1512496011951-a99932826d04?q=80&w=1000&auto=format&fit=crop', is_active: true },
];

interface Props {
    scrollY: SharedValue<number>;
    brands?: Brand[];
}

export function BrandSlider({ scrollY, brands }: Props) {
    const displayBrands = (brands && brands.length > 0) ? brands : (MOCK_BRANDS as Brand[]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Must Have</Text>
                <Text style={styles.subtitle}>FEATURED BRANDS</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={CARD_WIDTH + 12}
                decelerationRate="fast"
            >
                {displayBrands.map((brand) => (
                    <View key={brand.id} style={styles.card}>
                        <Image source={{ uri: brand.logo || 'https://via.placeholder.com/400x800' }} style={styles.bgImage} />
                        <View style={[StyleSheet.absoluteFill, styles.cardOverlay]} />

                        <View style={styles.cardContent}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.brandName}>{brand.name_en || brand.name}</Text>
                            </View>

                            <Pressable style={styles.exploreButton}>
                                <Text style={styles.exploreText}>EXPLORE</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 40,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#18181B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.8, // Tall portrait aspect ratio
        borderRadius: 8,
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    bgImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4, // Keep it dark like website
    },
    cardOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cardContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
    },
    exploreButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
        width: '85%',
        alignItems: 'center',
    },
    exploreText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
    }
});
