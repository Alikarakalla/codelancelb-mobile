import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export function AddToCartFooter() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) + 90 }]}>
            <Pressable style={({ pressed }) => [styles.favButton, pressed && styles.pressed]}>
                <Ionicons name="heart-outline" size={24} color="#94A3B8" />
            </Pressable>

            <Pressable
                onPress={() => router.push('/cart')}
                style={({ pressed }) => [styles.cartButton, pressed && styles.pressedOpacity]}
            >
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.cartText}>Add to Cart</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    favButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: '#F1F5F9',
    },
    cartButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#1152d4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    pressedOpacity: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    cartText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
});
