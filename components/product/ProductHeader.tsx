import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export function ProductHeader() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <BlurView
            intensity={80}
            tint="light" // or adaptive
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <View style={styles.content}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </Pressable>

                <Text style={styles.title}>Product Details</Text>

                <View style={styles.rightActions}>
                    <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                        <Ionicons name="share-outline" size={24} color="#0F172A" />
                    </Pressable>
                    <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                        <Ionicons name="bag-handle-outline" size={24} color="#0F172A" />
                        <View style={styles.badge} />
                    </Pressable>
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        height: 56,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#0F172A',
        flex: 1,
        textAlign: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    pressed: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1152d4',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
