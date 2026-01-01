import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link } from 'expo-router';

const PRODUCTS = [
    {
        id: 1,
        name: 'Leather Tote Bag',
        brand: 'Italian Leather',
        price: 120.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwS98HYL0TbUR0aK5NFKRNB9SDgrdV7XVL6fM38cASnCDdAKuoPNIGyIiqVr3CwtXntL7Cpxpw6YFZk6dxCvMOlomZyarrD1RlDQp6HlFQCHRe7shdzYa8R_K51MKYF63DelKGD6nl1D5-bPpRQ6ASK2ehr2iNmiHNQBUO25vQVD3SsCeMRC14erpfCUa4J4XvD-jAp70UxKds8VrfcnnKAcpZ6CZTUC9RVjEXAsOWpZqrSEJUIFvpVyodoW3HeMBkLBEOh_za14s',
    },
    {
        id: 2,
        name: 'Classic Chronograph',
        brand: 'Stainless Steel',
        price: 250.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS3YiA1qmFnAjiS0dAmZzWR_9jwBPFnAEtjrHbms0Z7od1X4RUeWgE5bh1Jwq4k1omR3pUzBDBAjyFNgc43RNAgkDPtJ3kqbCevf20uaUff6X3ZErPBFtowcMDyPq0Bt-g4WNis63fo5KA3uPnfUCvKG71quoZAhdSPc2khU3HCqRe5SubpQZFbZI2Tj_BLf_IxJGTyAqs1MD45V0nOrKWUljMpYgAMNERTDi8ka7mdXF8R_WnhKL-UbePTkTKH0rbx5MMqmjCeLF4',
    },
    {
        id: 3,
        name: 'Denim Jacket',
        brand: 'Vintage Wash',
        price: 85.00,
        originalPrice: 120.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYXoC6G8bzcB84Z8TUBOKpKAgWF1te9r0iccuVS028gIOAzcohmI1XrUJb9KYPNqAYzKGh6Gs1cl18JTzzYGuZuk7CT4WSod4jjyssw9fy8M-Q6WC9mCKdN_n1ool2mVDwm5SE6xI8Tmo36PKdGRCnbVvXeuSrUk-OIeNF-7YhaY6hc_K3uZC3RLTmEEbwjzqnqMYG7U0JLybDEBjWXvBFKLjXrQnITtkoXlcdCiLqLJ1nkdEsaaSIBsU5w3JwMzxsUHUhByHqXnPA',
        discount: true,
    },
    {
        id: 4,
        name: 'Suede Loafers',
        brand: 'Handcrafted',
        price: 110.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoVW81NuhvapFrzuV9CvsDJ6eptrPodyQmTYXz3aT_t8WPXyb2C-3ImCXwcU4Tm_zpRNq5p4XWT20_6Ni8pqzEWXh4CPVH35ykxGjlona0T8Gu5VrkyGO-Jv-DBOvCpi0dyEO2-0JUCPLyNxEU-ZAiiFkFwga8hXFa8n2Iw1Ur8ikch6uv6BR94MuTEyPuX-_ujdFNc2tw6tnS6qt2eBV5scx7Uw75NWL1PD6hXg_V3NqdXmq3amoyNC2a4qFyEqt89oZuKhjohf5S',
    },
];

export function ProductGrid() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>New Arrivals</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>
            <View style={styles.grid}>
                {PRODUCTS.map((product, index) => (
                    <Animated.View
                        key={product.id}
                        entering={FadeInDown.delay(index * 100).duration(600)}
                        style={styles.cardWrapper}
                    >
                        <Link href={`/product/${product.id}`} asChild>
                            <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                                    <Pressable style={styles.favButton}>
                                        <Ionicons name="heart-outline" size={18} color="#0F172A" />
                                    </Pressable>
                                    {product.discount && (
                                        <View style={styles.saleBadge}>
                                            <Text style={styles.saleText}>SALE</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                                    <Text style={styles.brand}>{product.brand}</Text>
                                    <View style={styles.priceRow}>
                                        {product.originalPrice && (
                                            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
                                        )}
                                        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        </Link>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1152d4',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8, // Gap compensation
    },
    cardWrapper: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 24,
    },
    card: {
        gap: 12,
    },
    pressed: {
        opacity: 0.95,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f6f6f8',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saleBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#EF4444', // red-500
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    info: {
        gap: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
    },
    brand: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B', // slate-500
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
    },
    originalPrice: {
        fontSize: 14,
        fontWeight: '400',
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
});
