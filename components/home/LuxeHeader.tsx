import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol'; // Using our SF Symbol wrapper or vector icons
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LuxeHeaderProps {
    showBackButton?: boolean;
    title?: string;
}

export function LuxeHeader({ showBackButton = false, title = 'SADEK' }: LuxeHeaderProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#18181B';
    const bgColor = isDark ? '#000' : '#fff';

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: bgColor }]}>
            <View style={styles.content}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {showBackButton ? (
                        <Pressable onPress={() => router.back()} style={styles.iconButton}>
                            <Feather name="arrow-left" size={22} color={textColor} />
                        </Pressable>
                    ) : (
                        <Pressable style={styles.iconButton}>
                            <Feather name="menu" size={24} color={textColor} />
                        </Pressable>
                    )}
                </View>

                {/* Center Section: Logo */}
                <View style={styles.centerSection}>
                    <Text style={[styles.title, { color: textColor }]}>S A D E K</Text>
                </View>

                {/* Right Section */}
                <View style={styles.rightSection}>
                    <Pressable style={styles.langButton}>
                        <Text style={[styles.langText, { color: textColor }]}>EN</Text>
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <Feather name="search" size={20} color={textColor} />
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <Feather name="shopping-bag" size={20} color={textColor} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
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
        fontSize: 18,
        fontWeight: '800', // extrabold
        letterSpacing: 2, // tracking-[0.1em]
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: Platform.select({ ios: 'Avenir Next', android: 'Roboto' }), // fallback for "Manrope"
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    langButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 4,
    },
    langText: {
        fontSize: 12,
        fontWeight: '700',
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    pressed: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#000',
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
