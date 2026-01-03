import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { LoyaltyReward } from '@/types/schema';
import { useAuth } from '@/hooks/use-auth-context';

export function LoyaltyRewards() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { reloadUser } = useAuth();
    const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<number | null>(null);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            const data = await api.getLoyaltyRewards();
            // The API returns a list of rewards. 
            // Depending on implementation it might be wrapped in data or direct array.
            // apiClient.ts handleResponse generic usually returns the json body.
            // Based on the controller, it returns the collection map directly or inside data. 
            // We'll safe check array.
            const list = Array.isArray(data) ? data : (data.data || []);
            setRewards(list);
        } catch (error) {
            console.error('Failed to load rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward: LoyaltyReward) => {
        Alert.alert(
            'Redeem Reward',
            `Are you sure you want to redeem "${reward.name}" for ${reward.points_required} points?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Redeem',
                    onPress: async () => {
                        setRedeemingId(reward.id);
                        try {
                            const res = await api.redeemLoyaltyReward(reward.id);
                            Alert.alert('Success', 'Reward redeemed successfully!');

                            // Reload rewards list
                            loadRewards();

                            // Refresh user data (points balance)
                            if (reloadUser) {
                                await reloadUser();
                            }
                        } catch (error: any) {
                            const msg = error.message.includes('422')
                                ? 'Insufficient points or conditions not met.'
                                : 'Failed to redeem reward. Please try again.';
                            Alert.alert('Redemption Failed', msg);
                        } finally {
                            setRedeemingId(null);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color="#1152d4" />
            </View>
        );
    }

    if (rewards.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Available Rewards</Text>

            <View style={styles.grid}>
                {rewards.map((reward) => (
                    <View
                        key={reward.id}
                        style={[
                            styles.card,
                            {
                                backgroundColor: isDark ? '#1a2230' : '#ffffff',
                                borderColor: isDark ? '#374151' : '#e5e7eb'
                            }
                        ]}
                    >
                        {reward.image && (
                            <Image source={{ uri: reward.image }} style={styles.image} contentFit="cover" />
                        )}

                        <View style={styles.cardContent}>
                            <View style={styles.rewardHeader}>
                                <Text style={[styles.rewardName, { color: isDark ? '#fff' : '#111318' }]}>
                                    {reward.name}
                                </Text>
                                <View style={styles.pointsBadge}>
                                    <Text style={styles.pointsText}>{reward.points_required} pts</Text>
                                </View>
                            </View>

                            {reward.description && (
                                <Text style={[styles.description, { color: isDark ? '#9ca3af' : '#616f89' }]} numberOfLines={2}>
                                    {reward.description}
                                </Text>
                            )}

                            <Pressable
                                style={[
                                    styles.redeemButton,
                                    !reward.can_redeem && styles.redeemButtonDisabled
                                ]}
                                onPress={() => reward.can_redeem && handleRedeem(reward)}
                                disabled={!reward.can_redeem || redeemingId === reward.id}
                            >
                                {redeemingId === reward.id ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.redeemButtonText}>
                                        {reward.can_redeem ? 'Redeem Now' : 'Not Enough Points'}
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    center: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        paddingHorizontal: 4,
    },
    grid: {
        gap: 12,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    cardContent: {
        padding: 16,
        gap: 12,
    },
    rewardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    rewardName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    pointsBadge: {
        backgroundColor: 'rgba(17, 82, 212, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pointsText: {
        color: '#1152d4',
        fontSize: 12,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    redeemButton: {
        backgroundColor: '#1152d4',
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    redeemButtonDisabled: {
        backgroundColor: '#94a3b8',
        opacity: 0.5,
    },
    redeemButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
