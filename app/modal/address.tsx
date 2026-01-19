import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CountryPicker } from 'react-native-country-codes-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/services/apiClient';

export default function AddressModalScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const [form, setForm] = useState({
        type: 'shipping',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        country: 'United States',
        countryCode: 'US',
        callingCode: '1',
        is_default: false,
    });

    const [loading, setLoading] = useState(false);
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);
    const [typePickerVisible, setTypePickerVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (params.data) {
            try {
                const initialData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
                setEditingId(initialData.id);
                setForm({
                    type: initialData.type || 'shipping',
                    address_line_1: initialData.address_line_1 || '',
                    address_line_2: initialData.address_line_2 || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    postal_code: initialData.postal_code || '',
                    phone: separatePhone(initialData.phone).phone,
                    country: initialData.country || 'United States',
                    countryCode: initialData.countryCode || 'US',
                    callingCode: separatePhone(initialData.phone).code || '1',
                    is_default: initialData.is_default || false,
                });
            } catch (e) {
                console.error("Failed to parse address data", e);
            }
        } else {
            // Auto-detect country based on IP for new addresses
            const fetchLocation = async () => {
                try {
                    const response = await fetch('https://ipapi.co/json/');
                    const data = await response.json();
                    if (data.country_code && data.country_name) {
                        setForm(prev => ({
                            ...prev,
                            country: data.country_name,
                            countryCode: data.country_code,
                            callingCode: data.country_calling_code?.replace('+', '') || '1',
                            city: data.city || prev.city,
                            state: data.region || prev.state,
                            postal_code: data.postal || prev.postal_code,
                        }));
                    }
                } catch (error) {
                    console.log('Error fetching location:', error);
                }
            };
            fetchLocation();
        }
    }, [params.data]);

    // Helper to extract calling code if phone is saved as +1555...
    const separatePhone = (fullPhone: string) => {
        if (!fullPhone) return { code: '1', phone: '' };
        if (fullPhone.startsWith('+')) {
            // Very basic heuristic: assume code is 1-3 digits. 
            return { code: '1', phone: fullPhone.replace(/^\+1/, '') };
        }
        return { code: '1', phone: fullPhone };
    };

    const handleSave = async () => {
        // Validate required fields
        if (!form.address_line_1 || !form.city || !form.state || !form.postal_code || !form.country) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Format phone number with country code
            const formattedPhone = form.phone ? `+${form.callingCode}${form.phone}` : '';

            const addressData = {
                type: form.type, // 'shipping' or 'billing'
                address_line_1: form.address_line_1,
                address_line_2: form.address_line_2,
                city: form.city,
                state: form.state,
                postal_code: form.postal_code,
                country: form.country,
                phone: formattedPhone,
                is_default: form.is_default,
            };

            if (editingId) {
                await api.updateAddress(editingId, addressData);
            } else {
                await api.createAddress(addressData);
            }

            router.back();
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header - Absolute Positioned */}
            <View style={[styles.header, {
                paddingTop: Platform.OS === 'ios' ? 20 : 0,
                height: Platform.OS === 'ios' ? 80 : 60,
                zIndex: 10,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
            }]}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
                </View>
                <Pressable onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="close" size={24} color={isDark ? '#e5e7eb' : '#4b5563'} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{
                    paddingTop: Platform.OS === 'ios' ? 100 : 80,
                    paddingBottom: 120,
                    paddingHorizontal: 20
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.form}>
                    {/* Address Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address Type <Text style={styles.required}>*</Text></Text>
                        <Pressable
                            style={styles.selectInput}
                            onPress={() => setTypePickerVisible(!typePickerVisible)}
                        >
                            <Text style={styles.inputValue}>{form.type === 'shipping' ? 'Shipping' : 'Billing'}</Text>
                            <MaterialIcons name="expand-more" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                        {typePickerVisible && (
                            <View style={styles.pickerDropdown}>
                                <Pressable
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setForm({ ...form, type: 'shipping' });
                                        setTypePickerVisible(false);
                                    }}
                                >
                                    <Text style={styles.pickerOptionText}>Shipping</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setForm({ ...form, type: 'billing' });
                                        setTypePickerVisible(false);
                                    }}
                                >
                                    <Text style={styles.pickerOptionText}>Billing</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Country - Using Library */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Country <Text style={styles.required}>*</Text></Text>
                        <Pressable
                            style={styles.selectInput}
                            onPress={() => setCountryPickerVisible(true)}
                        >
                            <Text style={styles.inputValue}>{form.country}</Text>
                            <MaterialIcons name="expand-more" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>

                        <CountryPicker
                            show={countryPickerVisible}
                            lang={'en'}
                            pickerButtonOnPress={(item) => {
                                setForm(prev => ({
                                    ...prev,
                                    country: item.name.en,
                                    countryCode: item.code,
                                    callingCode: item.dial_code.replace('+', ''),
                                }));
                                setCountryPickerVisible(false);
                            }}
                            onBackdropPress={() => setCountryPickerVisible(false)}
                            style={{
                                modal: {
                                    height: 500,
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                },
                                countryName: {
                                    color: isDark ? '#fff' : '#111827',
                                },
                                dialCode: {
                                    color: isDark ? '#9ca3af' : '#6b7280',
                                },
                                searchMessageText: {
                                    color: isDark ? '#9ca3af' : '#6b7280',
                                },
                                textInput: {
                                    color: isDark ? '#fff' : '#111827',
                                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                                }
                            }}
                        />
                    </View>

                    {/* Address Line 1 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address Line 1 <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Street address, P.O. box, company name, c/o"
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={form.address_line_1}
                            onChangeText={(t) => setForm({ ...form, address_line_1: t })}
                        />
                    </View>

                    {/* Address Line 2 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address Line 2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={form.address_line_2}
                            onChangeText={(t) => setForm({ ...form, address_line_2: t })}
                        />
                    </View>

                    {/* City */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter city"
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={form.city}
                            onChangeText={(t) => setForm({ ...form, city: t })}
                        />
                    </View>

                    {/* State & Zip Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>State/Province <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter state"
                                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                value={form.state}
                                onChangeText={(t) => setForm({ ...form, state: t })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Postal Code <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter postal code"
                                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                value={form.postal_code}
                                onChangeText={(t) => setForm({ ...form, postal_code: t })}
                            />
                        </View>
                    </View>

                    {/* Phone - Custom Input with Validation */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[styles.phoneContainer, isDark && styles.phoneContainerDark]}>
                            <Pressable
                                style={styles.countryCodeBtn}
                                onPress={() => setCountryPickerVisible(true)}
                            >
                                <Text style={styles.countryCodeText}>{form.callingCode ? `+${form.callingCode}` : '+1'}</Text>
                                <MaterialIcons name="arrow-drop-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </Pressable>
                            <View style={[styles.verticalDivider, isDark && { backgroundColor: '#374151' }]} />
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Enter phone number"
                                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                value={form.phone}
                                onChangeText={(t) => setForm({ ...form, phone: t })}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.saveButtonPressed
                    ]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent', // IMPORTANT for glass effect
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111827',
    },
    iconButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    form: {
        paddingTop: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#d1d5db' : '#374151',
    },
    required: {
        color: '#ef4444',
    },
    input: {
        height: 52,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)', // Semi-transparent for glass feel
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 15,
        color: isDark ? '#fff' : '#111827',
    },
    selectInput: {
        height: 52,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputValue: {
        fontSize: 15,
        color: isDark ? '#fff' : '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', // Footer background
        borderTopWidth: 1,
        borderTopColor: isDark ? '#374151' : '#f3f4f6',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    saveButton: {
        backgroundColor: '#1f2937',
        height: 56,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButtonPressed: {
        backgroundColor: '#111827',
        transform: [{ scale: 0.98 }],
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    phoneContainer: {
        height: 52,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneContainerDark: {
    },
    countryCodeBtn: {
        paddingHorizontal: 16,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    countryCodeText: {
        fontSize: 15,
        color: isDark ? '#9ca3af' : '#6b7280',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 15,
        color: isDark ? '#fff' : '#111827',
    },
    pickerDropdown: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    pickerOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#f3f4f6',
    },
    pickerOptionText: {
        fontSize: 15,
        color: isDark ? '#fff' : '#111827',
    },
});
