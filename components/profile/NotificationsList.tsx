import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Notification } from '@/types/schema';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function NotificationsList() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (isRefresh = false) => {
        try {
            if (isRefresh) setLoading(true); // Or use refreshing prop
            const p = isRefresh ? 1 : page;
            const res = await api.getNotifications(p);

            if (isRefresh) {
                setNotifications(res.data);
            } else {
                setNotifications(prev => [...prev, ...res.data]);
            }

            setHasMore(res.current_page < res.last_page);
            setPage(res.current_page);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications(true);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications(true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            fetchNotifications();
        }
    };

    const markAsRead = async (id: string, index: number) => {
        try {
            // Optimistic update
            const updated = [...notifications];
            if (!updated[index].read_at) {
                updated[index].read_at = new Date().toISOString();
                setNotifications(updated);
                await api.markNotificationRead(id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            await api.markAllNotificationsRead();
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => {
        const isRead = !!item.read_at;
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    { backgroundColor: isDark ? (isRead ? '#000' : '#1e293b') : (isRead ? '#fff' : '#eff6ff') }
                ]}
                onPress={() => markAsRead(item.id, index)}
            >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <IconSymbol name="bell.fill" size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#0f172a' }]}>{item.data?.title || 'Notification'}</Text>
                        {!isRead && <View style={styles.dot} />}
                    </View>
                    <Text style={[styles.body, { color: isDark ? '#cbd5e1' : '#64748b' }]}>{item.data?.body || ''}</Text>
                    <Text style={[styles.date, { color: isDark ? '#94a3b8' : '#94a3b8' }]}>
                        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && page === 1 && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Notifications</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="bell.slash" size={48} color={isDark ? '#475569' : '#cbd5e1'} />
                    <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 0,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    markAllRead: {
        fontSize: 14,
        color: '#4f46e5',
        fontWeight: '500',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
    },
    body: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
    }
});
