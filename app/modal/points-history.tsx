import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { LoyaltyLog } from '@/types/schema';
import { LiquidSheetContainer } from '@/components/ui/LiquidSheetContainer';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialIcons } from '@expo/vector-icons';

export default function PointsHistorySheet() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [history, setHistory] = useState<LoyaltyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true, // Content flows behind
                    headerTitle: () => (
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: isDark ? '#fff' : '#000',
                            letterSpacing: -0.4,
                        }}>
                            Points History
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    presentation: 'formSheet', // Native iOS Sheet
                    ...Platform.select({
                        ios: {
                            sheetAllowedDetents: [0.75, 1.0], // Native resizing
                            sheetGrabberVisible: true,
                            sheetCornerRadius: 24,
                            // NO headerBlurEffect - relying on native sheet background
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
            ) : history.length === 0 ? (
                <Text style={{ color: isDark ? '#9ca3af' : '#64748b', textAlign: 'center', marginTop: 100 }}>
                    No points history available.
                </Text>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 100 }}
                    style={{ flex: 1 }}
                >
                    <View style={[styles.list, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>
                        {history.map((log, index) => (
                            <View
                                key={log.id}
                                style={[
                                    styles.item,
                                    index !== history.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#f3f4f6' }
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
                                    <Text style={[styles.itemDesc, { color: isDark ? '#fff' : '#111318' }]}>
                                        {log.description || (log.points > 0 ? 'Points Earned' : 'Points Redeemed')}
                                    </Text>
                                    <Text style={[styles.itemDate, { color: isDark ? '#9ca3af' : '#616f89' }]}>
                                        {new Date(log.created_at).toLocaleDateString() + ' ' + new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
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
