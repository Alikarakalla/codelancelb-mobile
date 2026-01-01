import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Clipboard from 'expo-clipboard';

export function ReferralCard() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync('JANE2024');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Referral Program</Text>

            <View style={styles.card}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name="card-giftcard" size={32} color="#1152d4" />
                </View>

                <Text style={styles.cardTitle}>Invite Friends & Earn $10</Text>
                <Text style={styles.cardDesc}>
                    Share your unique code with friends. They get $10 off their first order, and you get $10 credit!
                </Text>

                <View style={styles.codeContainer}>
                    <View style={styles.codeBox}>
                        <Text style={styles.codeText}>JANE2024</Text>
                    </View>
                    <Pressable onPress={copyToClipboard} style={styles.copyButton}>
                        <MaterialIcons name="content-copy" size={20} color="#fff" />
                    </Pressable>
                </View>

                <Pressable style={styles.shareButton}>
                    <MaterialIcons name="share" size={16} color="#1152d4" />
                    <Text style={styles.shareText}>Share Link</Text>
                </Pressable>
            </View>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1152d4',
        borderStyle: 'dashed',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: isDark ? 'rgba(30, 64, 175, 0.2)' : '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    codeContainer: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
        maxWidth: 280,
    },
    codeBox: {
        flex: 1,
        height: 40,
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
    },
    codeText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'monospace',
        color: isDark ? '#fff' : '#111318',
        letterSpacing: 1,
    },
    copyButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#1152d4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    shareText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1152d4',
    },
});
