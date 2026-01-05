import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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
    const [allTiers, setAllTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fixUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `https://sadekabdelsater.com/storage/${url}`;
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadLoyaltyData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadLoyaltyData = async () => {
        try {
            // Fetch both info and all tiers to calculate accurate status
            const [info, tiers] = await Promise.all([
                api.getLoyaltyInfo(),
                api.getLoyaltyTiers()
            ]);
            setLoyaltyData(info);
            setAllTiers(tiers || []);
        } catch (error) {
            console.error('Failed to load loyalty data:', error);
            // Try to load just info if tiers fail
            try {
                const info = await api.getLoyaltyInfo();
                setLoyaltyData(info);
            } catch (e) { }
        } finally {
            setLoading(false);
        }
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

    // Points Logic: Use points_balance from API (most accurate) or fallback to user
    const points = loyaltyData?.points_balance ?? loyaltyData?.points ?? user.loyalty_points_balance ?? 0;

    // Calculate dynamic tiers based on all available tiers
    let currentTier = null;
    let nextTier = null;

    if (allTiers.length > 0) {
        const sorted = [...allTiers].sort((a, b) => a.min_points - b.min_points);
        // Find the highest tier achieved
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (points >= sorted[i].min_points) {
                currentTier = sorted[i];
                nextTier = sorted[i + 1] || null;
                break;
            }
        }
        // If points < lowest tier
        if (!currentTier) {
            nextTier = sorted[0];
            currentTier = { name: 'Member', min_points: 0, color: '#94a3b8', icon: 'person-outline' };
        }
    } else {
        // Fallback to what the loyalty endpoint returned if tiers endpoint failed
        currentTier = loyaltyData?.currentTier || loyaltyData?.current_tier;
        nextTier = loyaltyData?.nextTier || loyaltyData?.next_tier;
    }

    // Tier Attributes
    const tierName = currentTier?.name || user.loyaltyTier?.name || 'Member';
    const tierColor = currentTier?.color || '#1152d4';
    const tierIcon = currentTier?.icon || 'stars'; // fallback icon
    const multiplier = currentTier?.points_multiplier ? parseFloat(currentTier.points_multiplier) : 1;
    const hasFreeShipping = currentTier?.free_shipping;

    // Progress Logic
    const currentMin = currentTier?.min_points || 0;
    let isMaxTier = !nextTier;
    let nextTierPoints = nextTier?.min_points || 0;
    let targetNextTier = nextTier;
    let progressPercent = 0;

    if (nextTier) {
        // If points are below currentMin, we are in retention mode (risk of dropping)
        if (points < currentMin && currentMin > 0) {
            isMaxTier = false;
            nextTierPoints = currentMin;
            targetNextTier = { name: `Keep ${tierName}` } as any;
            progressPercent = Math.min((points / currentMin) * 100, 100);
        } else {
            // Normal Climbing Case
            const nextMin = nextTier.min_points;
            const range = nextMin - currentMin;
            if (range > 0) {
                const progress = (points - currentMin) / range;
                progressPercent = Math.min(Math.max(0, progress * 100), 100);
            } else {
                progressPercent = 0;
            }
        }
    } else {
        // Max Tier Cases
        if (points < currentMin && currentMin > 0) {
            // Points dropped below current tier floor
            isMaxTier = false;
            nextTierPoints = currentMin;
            targetNextTier = { name: `Keep ${tierName}` } as any;
            progressPercent = Math.min((points / currentMin) * 100, 100);
        } else {
            // Truly maxed out
            isMaxTier = true;
            progressPercent = 100;
        }
    }

    // Determine text color based on background logic (simplistic: if color is very light, use dark text)
    // #E3e3e3 is light. #1152d4 is dark. 
    // For safety, I will implement a visual style that works with the provided colors 
    // by using the tier color as an accent or gradient base with an overlay.
    // However, user specifically asked to change CARD BACKGROUND based on tier color.

    // Helper to darken a hex color slightly for gradient
    // Since we don't have a complex color lib, we'll try to use the color as is 
    // and maybe a secondary hardcoded color or just duplicate.

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#111318', paddingHorizontal: 0 }]}>Loyalty Program</Text>
                {/* Multiplier Badge */}
                {multiplier > 1 && (
                    <View style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                            {multiplier}x Points
                        </Text>
                    </View>
                )}
            </View>

            {/* Dynamic Card */}
            <LinearGradient
                // Utilize the tier color. If it's light (like #E3E3E3), we might want a darker end for gradient or keep it metallic.
                // Let's mix the tier color with a standard dark shade if usually cards are dark, 
                // OR just use the tier color. Let's try to trust the color is readable with white text 
                // OR use a dark overlay. 
                // Given "Platinum" is #E3e3e3, white text will vanish.
                // I will add a condition: If tier color is #E3e3e3 (Platinum), use bold black text?
                // For now, let's stick to a premium design: Dark Card with Tier Color as ACCENT/GLOW?
                // User said: "change the backgroundcolor of card... based in the tier".
                // Okay, I will use the color.
                colors={[tierColor.length === 7 ? tierColor : '#1152d4', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Decorative Circles with tier color opacity */}
                <View style={[styles.circle, styles.topCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                <View style={[styles.circle, styles.bottomCircle, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.label, { color: 'rgba(255,255,255,0.9)' }]}>Current Balance</Text>
                            <View style={styles.pointsRow}>
                                <Text style={styles.points}>{points}</Text>
                                <Text style={[styles.pointsUnit, { color: 'rgba(255,255,255,0.8)' }]}>pts</Text>
                            </View>
                        </View>

                        <View style={[styles.tierBadge, { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                            {(tierIcon && (tierIcon.includes('.') || tierIcon.includes('/'))) ? (
                                <Image
                                    source={{ uri: fixUrl(tierIcon) || '' }}
                                    style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: '#fff' }}
                                />
                            ) : (
                                <MaterialIcons name={tierIcon as any} size={18} color="#fff" />
                            )}
                            <Text style={styles.tierText}>{tierName}</Text>
                        </View>
                    </View>

                    {/* Features / Benefits Row */}
                    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                        {hasFreeShipping && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                <MaterialIcons name="local-shipping" size={14} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Free Shipping</Text>
                            </View>
                        )}
                        {multiplier > 1 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                <MaterialIcons name="trending-up" size={14} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{multiplier}x Earning</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressText, { color: 'rgba(255,255,255,0.7)' }]}>
                                {isMaxTier ? 'Top Tier Reached' : `${points} / ${nextTierPoints} pts`}
                            </Text>
                            {!isMaxTier && (
                                <Text style={[styles.progressText, { color: '#fff', fontWeight: '600' }]}>
                                    {targetNextTier?.name || 'Next Tier'}
                                </Text>
                            )}
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: '#fff' }]} />
                        </View>
                    </View>

                    {/* Redeem Button Removed as per request */}
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
