import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';

export function PersonalDetails() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const getFirstName = () => {
        if (user?.first_name) return user.first_name;
        return user?.name?.split(' ')[0] || '';
    };

    const getLastName = () => {
        if (user?.last_name) return user.last_name;
        const parts = user?.name?.split(' ');
        return parts && parts.length > 1 ? parts.slice(1).join(' ') : '';
    };

    const [form, setForm] = useState({
        firstName: getFirstName(),
        lastName: getLastName(),
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || '',
        country: user?.country || 'USA',
    });

    const styles = getStyles(isDark);

    const handleSave = async () => {
        // TODO: Implement API call to save user profile
        console.log('Saving user profile:', form);
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="person-outline" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.title, { marginTop: 16, textAlign: 'center' }]}>Sign in to view your profile</Text>
                        <Pressable
                            style={[styles.saveButton, { marginTop: 16 }]}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={styles.saveButtonText}>Sign In</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Personal Details</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>FIRST NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={form.firstName}
                            onChangeText={(t) => setForm({ ...form, firstName: t })}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>LAST NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={form.lastName}
                            onChangeText={(t) => setForm({ ...form, lastName: t })}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        value={form.email}
                        keyboardType="email-address"
                        onChangeText={(t) => setForm({ ...form, email: t })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PHONE</Text>
                    <TextInput
                        style={styles.input}
                        value={form.phone}
                        keyboardType="phone-pad"
                        onChangeText={(t) => setForm({ ...form, phone: t })}
                    />
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>COUNTRY</Text>
                        <View style={styles.selectInput}>
                            <Text style={styles.selectText}>{form.country}</Text>
                            <MaterialIcons name="expand-more" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                        </View>
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>CITY</Text>
                        <TextInput
                            style={styles.input}
                            value={form.city}
                            onChangeText={(t) => setForm({ ...form, city: t })}
                        />
                    </View>
                </View>

                <Pressable style={styles.saveButton} onPress={handleSave}>
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </Pressable>
            </View>
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
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    card: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#f3f4f6',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfInput: {
        flex: 1,
        gap: 6,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: isDark ? '#9ca3af' : '#616f89',
        letterSpacing: 0.5,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#e5e7eb',
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#fff' : '#111318',
        paddingHorizontal: 16,
        fontSize: 15,
    },
    selectInput: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#e5e7eb',
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    selectText: {
        fontSize: 15,
        color: isDark ? '#fff' : '#111318',
    },
    saveButton: {
        height: 48,
        backgroundColor: '#1152d4',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
