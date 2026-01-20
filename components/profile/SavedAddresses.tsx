import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import { api } from '@/services/apiClient';

import { AddressSkeleton } from '@/components/profile/skeletons/AddressSkeleton';

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export function SavedAddresses() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Reload when screen comes into focus (e.g. back from add/edit modal)
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                loadAddresses();
            }
        }, [isAuthenticated])
    );

    const loadAddresses = async () => {
        try {
            const data = await api.getAddresses();
            setAddresses(data || []);
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (address: any) => {
        router.push({
            pathname: '/modal/address',
            params: { data: JSON.stringify(address) }
        });
    };

    const handleDeleteAddress = (addressId: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteAddress(addressId);
                            await loadAddresses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete address.');
                        }
                    }
                }
            ]
        );
    };

    const getTypeIcon = (type?: string) => {
        switch (type?.toLowerCase()) {
            case 'billing':
                return { icon: 'payment', color: '#10b981' };
            case 'shipping':
            default:
                return { icon: 'local-shipping', color: '#18181b' };
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="location-on" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.title, { marginTop: 16, textAlign: 'center' }]}>Sign in to manage your addresses</Text>
                        <Pressable
                            style={[styles.addButton, { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#18181b', borderRadius: 12 }]}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Sign In</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Addresses</Text>
                </View>
                <View style={styles.list}>
                    <AddressSkeleton />
                    <AddressSkeleton />
                </View>
            </View>
        );
    }

    const renderAddress = ({ item }: { item: any }) => {
        const typeInfo = getTypeIcon(item.type);
        const addressText = [
            item.address_line_1,
            item.address_line_2,
            item.city,
            item.state,
            item.postal_code,
            item.country
        ].filter(Boolean).join(', ');

        return (
            <View style={styles.card}>
                <View style={[styles.iconBox, {
                    backgroundColor: isDark
                        ? `rgba(${parseInt(typeInfo.color.slice(1, 3), 16)}, ${parseInt(typeInfo.color.slice(3, 5), 16)}, ${parseInt(typeInfo.color.slice(5, 7), 16)}, 0.2)`
                        : '#eff6ff'
                }]}>
                    <MaterialIcons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                </View>
                <View style={styles.info}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.cardTitle}>{item.type || 'Shipping'}</Text>
                        {item.is_default && (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#10b981', borderRadius: 4 }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>DEFAULT</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.address} numberOfLines={2}>{addressText}</Text>
                    {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
                </View>
                <View style={styles.actions}>
                    <Pressable style={styles.actionBtn} onPress={() => handleEditAddress(item)}>
                        <MaterialIcons name="edit" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={() => handleDeleteAddress(item.id)}>
                        <MaterialIcons name="delete" size={20} color="#ef4444" />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Addresses</Text>
                <Pressable
                    onPress={() => router.push('/modal/address')}
                    style={styles.addButton}
                >
                    <MaterialIcons name="add" size={18} color="#18181b" />
                    <Text style={styles.addText}>Add New</Text>
                </Pressable>
            </View>

            {addresses.length === 0 ? (
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="location-off" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.address, { marginTop: 16, textAlign: 'center' }]}>No saved addresses yet</Text>
                        <Pressable
                            style={[styles.addButton, { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#18181b', borderRadius: 12 }]}
                            onPress={() => router.push('/modal/address')}
                        >
                            <MaterialIcons name="add" size={18} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Add Address</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddress}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#18181b',
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#f3f4f6',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        textTransform: 'capitalize',
    },
    address: {
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
        lineHeight: 20,
    },
    phone: {
        fontSize: 12,
        color: isDark ? '#6b7280' : '#9ca3af',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
});
