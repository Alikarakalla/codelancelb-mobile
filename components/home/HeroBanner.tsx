import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
// Aspect ratio 4:5 -> height = width * 1.25 roughly
const BANNER_HEIGHT = width * 1.1;

export function HeroBanner() {
    return (
        <View style={styles.container}>
            <Pressable style={styles.card}>
                <ImageBackground
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR1WsC6UIe0eExTjVTkfDgqU499LYooCM4W_mSCTmx_Y_kLSs2PjKkh8TubOYJhGZ5F6nxCvOPMWqSEoi29ZxmBNFSkAb-3AFk8U-Jwoq5vP-c1YEwiSUNhQS279GFcnpqDtetV2CMu3niWSQ5RKhn4CS2JIhllNsHUlkxTykrR4DRoUQHgxHvIqndszaCoxyGubZSi9suSO7LkCcgKPihraXauRZdPWyJkuaDBr51lIOVwWTuA8WZka9HZuf104zT0NOZPAvqpTvt' }}
                    style={styles.image}
                    resizeMode="cover"
                >
                    <View style={styles.overlay} />

                    <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.content}>
                        <View style={styles.textStack}>
                            <Text style={styles.subtitle}>New Collection</Text>
                            <Text style={styles.title}>Summer 2024 {'\n'}Essentials</Text>
                        </View>
                        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                            <Text style={styles.buttonText}>Shop Now</Text>
                        </Pressable>
                    </Animated.View>
                </ImageBackground>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    card: {
        width: '100%',
        height: BANNER_HEIGHT,
        borderRadius: 16, // rounded-xl
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    image: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // Light overlay, gradient handled via logic if needed, simple tint here
        // In React Native plain opacity overlay is easiest. 
        // For gradient "to-t from-black/60", we'd need LinearGradient. 
        // Assuming simple darken bottom for now to avoid extra dependencies if possible, 
        // but LinearGradient is standard in Expo.
    },
    content: {
        padding: 24,
        gap: 16,
        alignItems: 'flex-start',
    },
    textStack: {
        gap: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 38,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 9999, // full
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#0F172A',
        fontSize: 14,
        fontWeight: '800', // bold
        letterSpacing: 0.5,
    },
});
