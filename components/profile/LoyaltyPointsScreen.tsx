import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';

export function LoyaltyPointsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loyaltyData, setLoyaltyData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [info, logs] = await Promise.all([
                api.getLoyaltyInfo(),
                api.getLoyaltyHistory()
            ]);
            setLoyaltyData(info);
            setHistory(Array.isArray(logs) ? logs : (logs.data || []));
        } catch (error) {
            console.error('Failed to load loyalty details:', error);
        } finally {
            setLoading(false);
        }
    };

    const styles = getStyles(isDark);

    const points = loyaltyData?.points_balance ?? user?.loyalty_points_balance ?? 0;
    const tierName = loyaltyData?.current_tier?.name || 'Member';
    const tierColor = loyaltyData?.current_tier?.color || '#000';

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
                        <Text style={styles.title}>LOYALTY POINTS</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {/* Points Balance Card */}
                    <View style={styles.pointsCard}>
                        <Text style={styles.pointsLabel}>TOTAL BALANCE</Text>
                        <View style={styles.pointsRow}>
                            <Text style={styles.pointsValue}>{points}</Text>
                            <Text style={styles.pointsUnit}>PTS</Text>
                        </View>
                        <View style={styles.tierBadge}>
                            <MaterialIcons name="stars" size={16} color={isDark ? '#000' : '#fff'} />
                            <Text style={styles.tierText}>{tierName.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* History Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>POINTS HISTORY</Text>
                        <View style={styles.historyList}>
                            {loading ? (
                                <ActivityIndicator color={isDark ? '#fff' : '#000'} style={{ marginTop: 20 }} />
                            ) : history.length > 0 ? (
                                history.map((log) => (
                                    <View key={log.id} style={styles.historyCard}>
                                        <View style={[styles.historyIcon, { backgroundColor: log.points > 0 ? '#10b981' : '#ef4444' }]}>
                                            <MaterialIcons
                                                name={log.points > 0 ? "add" : "remove"}
                                                size={18}
                                                color="#fff"
                                            />
                                        </View>
                                        <View style={styles.historyInfo}>
                                            <Text style={styles.historyDesc}>{log.description || 'Points Transaction'}</Text>
                                            <Text style={styles.historyDate}>{new Date(log.created_at).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={[styles.historyPoints, { color: log.points > 0 ? '#10b981' : (isDark ? '#fff' : '#000') }]}>
                                            {log.points > 0 ? '+' : ''}{log.points}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>NO TRANSACTIONS FOUND.</Text>
                            )}
                        </View>
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
    pointsCard: {
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        backgroundColor: isDark ? '#000' : '#fff',
        marginBottom: 32,
    },
    pointsLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        letterSpacing: 2,
        marginBottom: 8,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 16,
    },
    pointsValue: {
        fontSize: 64,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
    },
    pointsUnit: {
        fontSize: 20,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 1,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: 1,
    },
    historyList: {
        gap: 12,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        gap: 16,
    },
    historyIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyInfo: {
        flex: 1,
    },
    historyDesc: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        textTransform: 'uppercase',
    },
    historyDate: {
        fontSize: 12,
        fontWeight: '600',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        marginTop: 2,
    },
    historyPoints: {
        fontSize: 16,
        fontWeight: '900',
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
