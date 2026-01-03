import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { LoyaltyLog } from '@/types/schema';

export function LoyaltyHistory() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [history, setHistory] = useState<LoyaltyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await api.getLoyaltyHistory();
            // Paginated response usually { data: [...], ...meta }
            const list = Array.isArray(data) ? data : (data.data || []);
            setHistory(list);
        } catch (error) {
            console.error('Failed to load loyalty history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color="#1152d4" />
            </View>
        );
    }

    if (history.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#111318' }]}>Points History</Text>

            <View style={[styles.list, { backgroundColor: isDark ? '#1a2230' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
                {history.map((log, index) => (
                    <View
                        key={log.id}
                        style={[
                            styles.item,
                            index !== history.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#f3f4f6' }
                        ]}
                    >
                        <View style={styles.iconBox}>
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
                                {new Date(log.created_at).toLocaleDateString()}
                            </Text>
                        </View>

                        <Text style={[
                            styles.pointsValue,
                            { color: log.points > 0 ? '#10b981' : isDark ? '#fff' : '#111318' }
                        ]}>
                            {log.points > 0 ? '+' : ''}{log.points}
                        </Text>
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
    list: {
        borderRadius: 16,
        borderWidth: 1,
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
        backgroundColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
    },
    itemDesc: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 12,
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
