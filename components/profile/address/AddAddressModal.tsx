import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CountryPicker } from 'react-native-country-codes-picker';


interface AddAddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (address: any) => void;
}

export function AddAddressModal({ visible, onClose, onSave }: AddAddressModalProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const [form, setForm] = useState({
        type: 'Shipping Address',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        formattedPhone: '',
        country: 'United States',
        countryCode: 'US',
        callingCode: '1',
    });

    const [loading, setLoading] = useState(false);
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);

    // Auto-detect country based on IP
    useEffect(() => {
        if (visible) {
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
                            zip: data.postal || prev.zip,
                        }));
                    }
                } catch (error) {
                    console.log('Error fetching location:', error);
                }
            };
            fetchLocation();
        }
    }, [visible]);

    const handleSelectCountry = (item: any) => {
        setForm(prev => ({
            ...prev,
            country: item.name?.en || prev.country, // The library might return different structure, but usually has name
            countryCode: item.code,
            callingCode: item.dial_code.replace('+', ''),
        }));
        setCountryPickerVisible(false);
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSave(form);
        setLoading(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 16 : 16 }]}>
                    <View style={styles.headerLeft}>
                        <Pressable onPress={onClose} style={styles.iconButton}>
                            <MaterialIcons name="close" size={24} color={isDark ? '#e5e7eb' : '#4b5563'} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Add New Address</Text>
                    </View>
                    <Pressable style={styles.iconButton}>
                        <MaterialIcons name="more-vert" size={24} color={isDark ? '#e5e7eb' : '#4b5563'} />
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.form}>
                        {/* Address Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address Type <Text style={styles.required}>*</Text></Text>
                            <View style={styles.selectInput}>
                                <Text style={styles.inputValue}>{form.type}</Text>
                                <MaterialIcons name="expand-more" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </View>
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

                            {/* Render Custom Country Picker Modal */}
                            <CountryPicker
                                show={countryPickerVisible}
                                lang={'en'}
                                pickerButtonOnPress={(item) => {
                                    setForm(prev => ({
                                        ...prev,
                                        country: item.name.en, // Or item.name depending on library version
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
                                value={form.address1}
                                onChangeText={(t) => setForm({ ...form, address1: t })}
                            />
                        </View>

                        {/* Address Line 2 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address Line 2</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                value={form.address2}
                                onChangeText={(t) => setForm({ ...form, address2: t })}
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
                                    value={form.zip}
                                    onChangeText={(t) => setForm({ ...form, zip: t })}
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
        </Modal>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#f3f4f6',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
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
        padding: 20,
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
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 15,
        color: isDark ? '#fff' : '#111827',
    },
    selectInput: {
        height: 52,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
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
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
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
        backgroundColor: '#1f2937', // primary dark gray
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
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneContainerDark: {
        // Just a helper if needed, but main style handles it
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
});

