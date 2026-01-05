import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { LoyaltyReward } from '@/types/schema';
import { useAuth } from '@/hooks/use-auth-context';
import { LiquidSheetContainer } from '@/components/ui/LiquidSheetContainer';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable, Platform } from 'react-native';

export default function AvailableRewardsSheet() {
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
                            await api.redeemLoyaltyReward(reward.id);
                            Alert.alert('Success', 'Reward redeemed successfully!');
                            loadRewards();
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

    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: () => (
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: isDark ? '#fff' : '#000',
                            letterSpacing: -0.4,
                        }}>
                            Available Rewards
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    presentation: 'formSheet', // Native iOS Sheet
                    ...Platform.select({
                        ios: {
                            sheetAllowedDetents: [0.75, 1.0], // Native resizing
                            sheetGrabberVisible: true,
                            sheetCornerRadius: 24,
                            // NO headerBlurEffect - Rely on native sheet
                            headerLeft: () => (
                                <Pressable
                                    onPress={() => router.back()}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 50,
                                        backgroundColor: 'transparent',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: 'transparent',
                                        marginHorizontal: 8,
                                    }}
                                >
                                    <IconSymbol
                                        name="chevron.left"
                                        color={isDark ? '#fff' : '#000'}
                                        size={24}
                                        weight="medium"
                                    />
                                </Pressable>
                            ),
                        },
                        android: {
                            headerLeft: () => (
                                <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                                    <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} />
                                </Pressable>
                            ),
                        }
                    })
                } as any}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#1152d4" style={{ marginTop: 100 }} />
            ) : rewards.length === 0 ? (
                <Text style={{ color: isDark ? '#9ca3af' : '#64748b', textAlign: 'center', marginTop: 100 }}>
                    No rewards available at the moment.
                </Text>
            ) : (
                <ScrollView contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingTop: 100, paddingBottom: 40 }}>
                    {rewards.map((reward) => (
                        <View
                            key={reward.id}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }
                            ]}
                        >
                            {reward.image && (
                                <Image source={{ uri: reward.image }} style={styles.image} contentFit="cover" />
                            )}
                            <View style={styles.cardContent}>
                                <View style={styles.headerRow}>
                                    <Text style={[styles.rewardName, { color: isDark ? '#fff' : '#000' }]}>{reward.name}</Text>
                                    <View style={styles.pointsBadge}>
                                        <Text style={styles.pointsText}>{reward.points_required} pts</Text>
                                    </View>
                                </View>
                                {reward.description && (
                                    <Text style={[styles.description, { color: isDark ? '#9ca3af' : '#64748b' }]}>
                                        {reward.description}
                                    </Text>
                                )}
                                <LiquidGlassButton
                                    text={redeemingId === reward.id ? 'Redeeming...' : (reward.can_redeem ? 'Redeem' : 'Not Enough Points')}
                                    height={40}
                                    onPress={() => reward.can_redeem && handleRedeem(reward)}
                                    style={{ marginTop: 12, opacity: reward.can_redeem ? 1 : 0.6 }}
                                />
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    cardContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rewardName: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },
    pointsBadge: {
        backgroundColor: 'rgba(17,82,212,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginLeft: 8,
    },
    pointsText: {
        color: '#1152d4',
        fontSize: 13,
        fontWeight: '700',
    },
    description: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 8,
    }
});
