import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AddAddressModal } from '@/components/profile/address/AddAddressModal';

export function SavedAddresses() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleSaveAddress = (address: any) => {
        console.log('Saving address:', address);
        // Here you would typically update the local state or call an API
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Addresses</Text>
                <Pressable onPress={() => setIsModalOpen(true)} style={styles.addButton}>
                    <MaterialIcons name="add" size={18} color="#1152d4" />
                    <Text style={styles.addText}>Add New</Text>
                </Pressable>
            </View>

            <View style={styles.list}>
                {/* Home Address */}
                <View style={styles.card}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(30, 64, 175, 0.2)' : '#eff6ff' }]}>
                        <MaterialIcons name="home" size={24} color="#1152d4" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.cardTitle}>Home</Text>
                        <Text style={styles.address} numberOfLines={1}>123 Main Street, Apt 4B, New York, NY 10001</Text>
                    </View>
                    <View style={styles.actions}>
                        <Pressable style={styles.actionBtn}>
                            <MaterialIcons name="edit" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                        </Pressable>
                        <Pressable style={styles.actionBtn}>
                            <MaterialIcons name="delete" size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                {/* Office Address */}
                <View style={styles.card}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? '#1f2937' : '#f9fafb' }]}>
                        <MaterialIcons name="work" size={24} color="#6b7280" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.cardTitle}>Office</Text>
                        <Text style={styles.address} numberOfLines={1}>456 Corporate Blvd, Suite 200, Seattle, WA</Text>
                    </View>
                    <View style={styles.actions}>
                        <Pressable style={styles.actionBtn}>
                            <MaterialIcons name="edit" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                        </Pressable>
                        <Pressable style={styles.actionBtn}>
                            <MaterialIcons name="delete" size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>
            </View>


            <AddAddressModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAddress}
            />
        </View >
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
        color: '#1152d4',
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#f3f4f6',
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
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        marginBottom: 2,
    },
    address: {
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
});
