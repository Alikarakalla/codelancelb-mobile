import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function LoyaltyCard() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Loyalty Program</Text>

            <LinearGradient
                colors={['#1152d4', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Decorative Circles */}
                <View style={[styles.circle, styles.topCircle]} />
                <View style={[styles.circle, styles.bottomCircle]} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.label}>Current Balance</Text>
                            <View style={styles.pointsRow}>
                                <Text style={styles.points}>450</Text>
                                <Text style={styles.pointsUnit}>pts</Text>
                            </View>
                        </View>

                        <View style={styles.tierBadge}>
                            <MaterialIcons name="star" size={16} color="#fff" />
                            <Text style={styles.tierText}>Gold Tier</Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressText}>450 pts</Text>
                            <Text style={styles.progressText}>1000 pts (Platinum)</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '45%' }]} />
                        </View>
                    </View>

                    <Pressable style={styles.redeemButton}>
                        <Text style={styles.redeemText}>Redeem Rewards</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        paddingHorizontal: 4,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
        // blur is not directly supported in RN view styles without BlurView, 
        // but opacity gives a subtle effect
    },
    topCircle: {
        width: 128,
        height: 128,
        top: -40,
        right: -40,
    },
    bottomCircle: {
        width: 96,
        height: 96,
        bottom: -20,
        left: -20,
    },
    content: {
        zIndex: 1,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#bfdbfe',
        marginBottom: 4,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    points: {
        fontSize: 32,
        fontWeight: '700',
        color: '#ffffff',
    },
    pointsUnit: {
        fontSize: 18,
        color: '#bfdbfe',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    tierText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    progressContainer: {
        gap: 8,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#bfdbfe',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 4,
    },
    redeemButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    redeemText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1152d4',
    },
});
