import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';

export function RewardsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, reloadUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<number | null>(null);
    const [rewards, setRewards] = useState<any[]>([]);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [info, rewardsData] = await Promise.all([
                api.getLoyaltyInfo(),
                api.getLoyaltyRewards()
            ]);
            setPoints(info?.points_balance ?? user?.loyalty_points_balance ?? 0);
            setRewards(Array.isArray(rewardsData) ? rewardsData : (rewardsData.data || []));
        } catch (error) {
            console.error('Failed to load rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward: any) => {
        if (points < reward.points_required) {
            Alert.alert('NOT ENOUGH POINTS', `YOU NEED ${reward.points_required} PTS TO CLAIM THIS REWARD.`);
            return;
        }

        Alert.alert(
            'CLAIM REWARD',
            `REDEEM ${reward.points_required} PTS FOR ${reward.name.toUpperCase()}?`,
            [
                { text: 'CANCEL', style: 'cancel' },
                {
                    text: 'CLAIM',
                    onPress: async () => {
                        setRedeemingId(reward.id);
                        try {
                            const res = await api.redeemLoyaltyReward(reward.id);
                            Alert.alert('SUCCESS', 'REWARD CLAIMED SUCCESSFULLY!');
                            // Update points locally
                            setPoints(prev => prev - reward.points_required);
                            if (reloadUser) reloadUser();
                        } catch (error: any) {
                            console.error('Redeem error', error);
                            Alert.alert('ERROR', error.message || 'FAILED TO CLAIM REWARD.');
                        } finally {
                            setRedeemingId(null);
                        }
                    }
                }
            ]
        );
    };

    const styles = getStyles(isDark);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <IconSymbol
                                name="chevron.left"
                                color={isDark ? '#fff' : '#000'}
                                size={24}
                            />
                        </Pressable>
                    )
                }}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Header Title */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={styles.title}>REWARDS</Text>
                                <View style={styles.titleUnderline} />
                            </View>
                            <View style={styles.pointsBadge}>
                                <Text style={styles.pointsBadgeValue}>{points}</Text>
                                <Text style={styles.pointsBadgeUnit}>PTS</Text>
                            </View>
                        </View>
                    </View>

                    {/* Rewards Grid/List */}
                    <View style={styles.rewardsList}>
                        {loading ? (
                            <ActivityIndicator color={isDark ? '#fff' : '#000'} style={{ marginTop: 20 }} />
                        ) : rewards.length > 0 ? (
                            rewards.map((reward) => {
                                const canAfford = points >= reward.points_required;
                                return (
                                    <View key={reward.id} style={[styles.rewardCard, !canAfford && styles.lockedCard]}>
                                        <View style={styles.rewardImageContainer}>
                                            {reward.image ? (
                                                <Image source={{ uri: reward.image }} style={styles.rewardImage} contentFit="cover" />
                                            ) : (
                                                <View style={styles.rewardPlaceholder}>
                                                    <MaterialIcons name="redeem" size={32} color={isDark ? '#fff' : '#000'} />
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.rewardInfo}>
                                            <Text style={styles.rewardName}>{reward.name.toUpperCase()}</Text>
                                            <Text style={styles.rewardPoints}>{reward.points_required} PTS REQUIRED</Text>

                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.redeemBtn,
                                                    !canAfford && styles.redeemBtnDisabled,
                                                    pressed && canAfford && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                                                ]}
                                                onPress={() => handleRedeem(reward)}
                                                disabled={!canAfford || redeemingId === reward.id}
                                            >
                                                {redeemingId === reward.id ? (
                                                    <ActivityIndicator size="small" color={isDark ? '#000' : '#fff'} />
                                                ) : (
                                                    <Text style={[styles.redeemBtnText, !canAfford && styles.redeemBtnTextDisabled]}>
                                                        {canAfford ? 'CLAIM REWARD' : 'LOCKED'}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyText}>NO REWARDS AVAILABLE AT THIS TIME.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000' : '#fff',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    backButton: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
    },
    content: {
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
    },
    titleUnderline: {
        width: 40,
        height: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        marginTop: 4,
    },
    pointsBadge: {
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    pointsBadgeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
    },
    pointsBadgeUnit: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        letterSpacing: 1,
    },
    rewardsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
    },
    rewardCard: {
        width: '48%',
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: isDark ? '#000' : '#fff',
    },
    lockedCard: {
        opacity: 0.7,
    },
    rewardImageContainer: {
        height: 120,
        backgroundColor: isDark ? '#111' : '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#eee',
    },
    rewardImage: {
        width: '100%',
        height: '100%',
    },
    rewardPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardInfo: {
        padding: 12,
        gap: 4,
    },
    rewardName: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
    },
    rewardPoints: {
        fontSize: 10,
        fontWeight: '800',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    redeemBtn: {
        height: 40,
        backgroundColor: isDark ? '#fff' : '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    redeemBtnDisabled: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    },
    redeemBtnText: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 1,
    },
    redeemBtnTextDisabled: {
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    },
    emptyText: {
        fontSize: 12,
        fontWeight: '700',
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    }
});
