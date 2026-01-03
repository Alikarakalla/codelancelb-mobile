import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import { api } from '@/services/apiClient';
import { LoyaltySkeleton } from '@/components/profile/skeletons/LoyaltySkeleton';

export function LoyaltyCard() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loyaltyData, setLoyaltyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadLoyaltyData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadLoyaltyData = async () => {
        try {
            const data = await api.getLoyaltyInfo();
            setLoyaltyData(data);
        } catch (error) {
            console.error('Failed to load loyalty data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressPercentage = () => {
        if (!loyaltyData?.currentTier || !loyaltyData?.nextTier) return 0;
        const current = loyaltyData.points || 0;
        const min = loyaltyData.currentTier.min_points || 0;
        const max = loyaltyData.nextTier.min_points || 1000;
        return Math.min(((current - min) / (max - min)) * 100, 100);
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Loyalty Program</Text>
                <LinearGradient
                    colors={['#1152d4', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.content}>
                        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                            <MaterialIcons name="card-giftcard" size={48} color="rgba(255,255,255,0.8)" />
                            <Text style={[styles.label, { marginTop: 16, textAlign: 'center', fontSize: 16 }]}>Sign in to view your loyalty status</Text>
                            <Pressable
                                style={[styles.redeemButton, { marginTop: 16 }]}
                                onPress={() => router.push('/login')}
                            >
                                <Text style={styles.redeemText}>Sign In</Text>
                            </Pressable>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    if (loading) {
        return <LoyaltySkeleton />;
    }

    const points = loyaltyData?.points || user.loyalty_points_balance || 0;
    const tierName = loyaltyData?.currentTier?.name || user.loyaltyTier?.name || 'Member';
    const nextTierName = loyaltyData?.nextTier?.name || 'Platinum';
    const nextTierPoints = loyaltyData?.nextTier?.min_points || 1000;
    const progressPercent = getProgressPercentage();

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
                                <Text style={styles.points}>{points}</Text>
                                <Text style={styles.pointsUnit}>pts</Text>
                            </View>
                        </View>

                        <View style={styles.tierBadge}>
                            <MaterialIcons name="star" size={16} color="#fff" />
                            <Text style={styles.tierText}>{tierName}</Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressText}>{points} pts</Text>
                            <Text style={styles.progressText}>{nextTierPoints} pts ({nextTierName})</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                        </View>
                    </View>

                    <Pressable style={styles.redeemButton} onPress={() => console.log('Navigate to rewards')}>
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
