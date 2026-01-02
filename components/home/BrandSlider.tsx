import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { SharedValue } from 'react-native-reanimated';
import { Brand } from '@/types/schema';
import { MOCK_BRANDS } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;

interface Props {
    scrollY: SharedValue<number>;
    brands?: Brand[];
}
export function BrandSlider({ scrollY, brands }: Props) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const displayBrands = (brands && brands.length > 0) ? brands : (MOCK_BRANDS as Brand[]);

    const handlePress = (brandId: number) => {
        router.push({ pathname: '/shop', params: { brand_id: brandId } });
    };

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <View style={styles.header}>
                <Text style={[styles.title, isDark && { color: '#fff' }]}>Must Have</Text>
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
                    <Pressable key={brand.id} style={styles.card} onPress={() => handlePress(brand.id)}>
                        <Image source={{ uri: brand.logo || 'https://via.placeholder.com/400x800' }} style={styles.bgImage} />
                        <View style={[StyleSheet.absoluteFill, styles.cardOverlay]} />

                        <View style={styles.cardContent}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.brandName}>{brand.name_en || brand.name}</Text>
                            </View>

                            <View style={styles.exploreButton}>
                                <Text style={styles.exploreText}>EXPLORE</Text>
                            </View>
                        </View>
                    </Pressable>
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
