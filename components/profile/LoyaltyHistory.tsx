import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { LoyaltyLog } from '@/types/schema';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function LoyaltyHistory() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const isDark = colorScheme === 'dark';
    const [history, setHistory] = useState<LoyaltyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await api.getLoyaltyHistory();
            const list = Array.isArray(data) ? data : (data.data || []);
            setHistory(list);
        } catch (error) {
            console.error('Failed to load loyalty history:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayedHistory = history.slice(0, 2);

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Points History</Text>

                <Pressable
                    onPress={() => router.push('/loyalty-points')}
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

            {loading ? (
                <View style={{ gap: 12 }}>
                    {[1, 2].map((i) => (
                        <View key={i} style={[styles.card, { height: 72, backgroundColor: isDark ? '#1C1C1E' : '#f0f0f0' }]} />
                    ))}
                </View>
            ) : displayedHistory.length === 0 ? (
                <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 4 }}>No history available.</Text>
            ) : (
                <View style={{ gap: 12 }}>
                    {displayedHistory.map((log) => (
                        <View
                            key={log.id}
                            style={[
                                styles.card,
                                { backgroundColor: isDark ? '#1C1C1E' : '#fff' }
                            ]}
                        >
                            <View style={[styles.iconBox, { backgroundColor: log.points > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                <MaterialIcons
                                    name={log.points > 0 ? "add-circle" : "remove-circle"}
                                    size={24}
                                    color={log.points > 0 ? "#10b981" : "#ef4444"}
                                />
                            </View>

                            <View style={styles.itemContent}>
                                <Text style={[styles.itemDesc, { color: isDark ? '#fff' : '#111318' }]} numberOfLines={1}>
                                    {log.description || (log.points > 0 ? 'Points Earned' : 'Points Redeemed')}
                                </Text>
                                <Text style={[styles.itemDate, { color: isDark ? '#9ca3af' : '#616f89' }]}>
                                    {new Date(log.created_at).toLocaleDateString()}
                                </Text>
                            </View>

                            <Text style={[
                                styles.pointsValue,
                                { color: log.points > 0 ? '#10b981' : isDark ? '#fff' : '#111318' }
                            ]}>
                                {log.points > 0 ? '+' : ''}{log.points} pts
                            </Text>
                        </View>
                    ))}
                </View>
            )}
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
        padding: 16,
        borderRadius: 16,
        gap: 12,
        // Card Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
    },
    itemDesc: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 13,
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
