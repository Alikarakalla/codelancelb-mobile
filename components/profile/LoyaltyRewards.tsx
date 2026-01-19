import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api } from '@/services/apiClient';
import { LoyaltyReward } from '@/types/schema';
import { Image } from 'expo-image';

export function LoyaltyRewards() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const isDark = colorScheme === 'dark';
    const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            const data = await api.getLoyaltyRewards();
            const list = Array.isArray(data) ? data : (data.data || []);
            setRewards(list);
        } catch (error) {
            console.error('Failed to load rewards widget:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayedRewards = rewards.slice(0, 2);

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Rewards</Text>

                <Pressable
                    onPress={() => router.push('/modal/available-rewards')}
                    style={styles.nativeGlassWrapper}
                >
                    <IconSymbol
                        name="chevron.right"
                        color={isDark ? '#fff' : '#000'}
                        size={22}
                        weight="medium"
                    />
                </Pressable>
            </View>

            {/* Rewards List */}
            <View style={{ gap: 12 }}>
                {loading ? (
                    // Simple Skeleton
                    [1, 2].map((i) => (
                        <View key={i} style={[styles.card, { height: 80, backgroundColor: isDark ? '#1e293b' : '#f0f0f0' }]} />
                    ))
                ) : displayedRewards.length > 0 ? (
                    displayedRewards.map((reward) => (
                        <Pressable
                            key={reward.id}
                            style={[
                                styles.card,
                                { backgroundColor: isDark ? '#1e293b' : '#fff' }
                            ]}
                            onPress={() => router.push('/modal/available-rewards')}
                        >
                            {/* Image Placeholder or Actual Image */}
                            <View style={[styles.rewardImage, { backgroundColor: isDark ? '#0f172a' : '#F1F5F9' }]}>
                                {reward.image ? (
                                    <Image source={{ uri: reward.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                ) : (
                                    <IconSymbol name="gift.fill" color={isDark ? '#6366f1' : '#4f46e5'} size={24} />
                                )}
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={[styles.rewardName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
                                    {reward.name}
                                </Text>
                                <Text style={{ color: '#6366f1', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                                    {reward.points_required} pts
                                </Text>
                            </View>

                            {/* Unlock Status */}
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: reward.can_redeem ? 'rgba(99,102,241,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: reward.can_redeem ? '#6366f1' : isDark ? '#888' : '#999' }}>
                                    {reward.can_redeem ? 'Claim' : 'Locked'}
                                </Text>
                            </View>
                        </Pressable>
                    ))
                ) : (
                    <Text style={{ color: '#888', fontStyle: 'italic' }}>No rewards available.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    nativeGlassWrapper: {
        width: 36,
        height: 36,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            }
        })
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
        // Card Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rewardImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    rewardName: {
        fontSize: 15,
        fontWeight: '600',
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
});
