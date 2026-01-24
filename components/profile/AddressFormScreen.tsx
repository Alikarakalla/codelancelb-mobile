import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { api } from '@/services/apiClient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Dropdown } from 'react-native-element-dropdown/lib/module';
import { Country, State, City } from 'country-state-city';

export function AddressFormScreen() {
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
        country: 'Lebanon',
        countryCode: 'LB',
        stateCode: '',
        callingCode: '961',
        is_default: false,
    });

    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Dynamic Lists
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    useEffect(() => {
        // Load countries initially
        const allCountries = Country.getAllCountries().map(c => ({
            label: `${c.flag} ${c.name}`,
            value: c.isoCode,
            phone: (c.phonecode || '').replace('+', ''),
            name: c.name
        }));
        setCountries(allCountries);

        if (params.data) {
            try {
                const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
                if (data?.id) {
                    setEditingId(data.id);

                    // Find country code if possible
                    const countryObj = Country.getAllCountries().find(c => c.name === data.country || c.isoCode === data.countryCode);
                    const countryCode = countryObj?.isoCode || 'LB';

                    let phoneRaw = data.phone || '';
                    let callingCode = '961';

                    if (phoneRaw.startsWith('+')) {
                        // Try to find matching country by phone code
                        const possibleMatch = allCountries.find(c =>
                            c.phone && phoneRaw.startsWith('+' + c.phone)
                        );
                        if (possibleMatch) {
                            callingCode = possibleMatch.phone;
                            phoneRaw = phoneRaw.replace('+' + callingCode, '').trim();
                        } else {
                            // Split fallback
                            const parts = phoneRaw.split(' ');
                            if (parts.length > 1) {
                                callingCode = parts[0].replace('+', '');
                                phoneRaw = parts.slice(1).join('').trim();
                            }
                        }
                    }

                    // Pre-load states and cities for the edit mode
                    const statesRaw = State.getStatesOfCountry(countryCode).map(i => ({ label: i.name, value: i.isoCode }));
                    setStates(statesRaw);

                    const stateObj = State.getStatesOfCountry(countryCode).find(i => i.name === data.state);
                    if (stateObj) {
                        const citiesRaw = City.getCitiesOfState(countryCode, stateObj.isoCode).map(i => ({ label: i.name, value: i.name }));
                        setCities(citiesRaw);
                    }

                    setForm({
                        type: data.type || 'shipping',
                        address_line_1: data.address_line_1 || '',
                        address_line_2: data.address_line_2 || '',
                        city: data.city || '',
                        state: data.state || '',
                        postal_code: data.postal_code || '',
                        phone: phoneRaw,
                        country: data.country || (countryObj?.name || 'Lebanon'),
                        countryCode: countryCode,
                        stateCode: stateObj?.isoCode || '',
                        callingCode: callingCode,
                        is_default: data.is_default || false,
                    });
                }
            } catch (e) {
                console.error("Edit mode parse error", e);
            }
        } else {
            // Add Mode: Pre-load states for default country (Lebanon / LB)
            const defaultStates = State.getStatesOfCountry('LB').map(i => ({ label: i.name, value: i.isoCode }));
            setStates(defaultStates);
        }
    }, [params.data]);

    const onCountryChange = (item: any) => {
        setForm(prev => ({
            ...prev,
            country: item.name,
            countryCode: item.value,
            callingCode: item.phone,
            state: '',
            stateCode: '',
            city: ''
        }));

        const s = State.getStatesOfCountry(item.value).map(i => ({ label: i.name, value: i.isoCode }));
        setStates(s);
        setCities([]);
    };

    const onStateChange = (item: any) => {
        setForm(prev => ({
            ...prev,
            state: item.label,
            stateCode: item.value,
            city: ''
        }));

        const c = City.getCitiesOfState(form.countryCode, item.value).map(i => ({ label: i.name, value: i.name }));
        setCities(c);
    };

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const onCityChange = (item: any) => {
        setForm(prev => ({ ...prev, city: item.value }));
    };

    const handleSave = async () => {
        if (!form.address_line_1 || !form.city || !form.country) {
            Alert.alert('REQUIRED', 'PLEASE FILL IN ALL MANDATORY FIELDS.');
            return;
        }

        setLoading(true);
        try {
            // Safety Strip: Remove duplicate calling code if user entered it
            let purePhone = form.phone.trim().replace(/\s+/g, '');
            const prefixWithPlus = `+${form.callingCode}`;
            const prefixNoPlus = `${form.callingCode}`;

            if (purePhone.startsWith(prefixWithPlus)) {
                purePhone = purePhone.substring(prefixWithPlus.length);
            } else if (purePhone.startsWith(prefixNoPlus)) {
                // Only strip if it's the calling code and not just a phone starting with the same digits
                // Usually calling codes are 2-3 digits. 
                // A safer way is to check if it's longer than the pure number
                if (purePhone.length > form.callingCode.length) {
                    purePhone = purePhone.substring(prefixNoPlus.length);
                }
            }

            const formattedPhone = purePhone ? `+${form.callingCode}${purePhone}` : '';
            const addressData = {
                type: form.type,
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
            console.error('Save error', error);
            Alert.alert('ERROR', 'FAILED TO SAVE ADDRESS.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTransparent: true,
                        headerTitle: '',
                        headerLeft: () => (
                            <Pressable onPress={() => router.back()} style={styles.backButton}>
                                <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} />
                            </Pressable>
                        ),
                        headerRight: () => (
                            <BlurView
                                intensity={Platform.OS === 'ios' ? 20 : 100}
                                tint={isDark ? 'dark' : 'light'}
                                style={styles.headerTabs}
                            >
                                <Pressable
                                    onPress={() => setForm({ ...form, type: 'shipping' })}
                                    style={[styles.tabItem, form.type === 'shipping' && styles.tabItemActive]}
                                >
                                    <Text style={[styles.tabText, form.type === 'shipping' && styles.tabTextActive]}>SHIP</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setForm({ ...form, type: 'billing' })}
                                    style={[styles.tabItem, form.type === 'billing' && styles.tabItemActive]}
                                >
                                    <Text style={[styles.tabText, form.type === 'billing' && styles.tabTextActive]}>BILL</Text>
                                </Pressable>
                            </BlurView>
                        )
                    }}
                />

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{editingId ? 'EDIT' : 'ADD'}</Text>
                            <Text style={styles.titleBold}>ADDRESS</Text>
                            <View style={styles.titleUnderline} />
                        </View>

                        <View style={styles.form}>
                            {/* Country Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>COUNTRY</Text>
                                <Dropdown
                                    style={[
                                        styles.dropdown,
                                        focusedField === 'country' && styles.inputFocused
                                    ]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={countries}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="SELECT COUNTRY"
                                    searchPlaceholder="SEARCH..."
                                    value={form.countryCode}
                                    onFocus={() => setFocusedField('country')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={onCountryChange}
                                    containerStyle={styles.dropdownContainer}
                                    itemTextStyle={styles.itemText}
                                    renderRightIcon={() => (
                                        <MaterialIcons
                                            name="expand-more"
                                            size={20}
                                            color={isDark ? '#fff' : '#000'}
                                            style={{ opacity: 0.5 }}
                                        />
                                    )}
                                />
                            </View>

                            {/* State Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>STATE / AREA</Text>
                                {states.length > 0 ? (
                                    <Dropdown
                                        style={[
                                            styles.dropdown,
                                            focusedField === 'state' && styles.inputFocused
                                        ]}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        inputSearchStyle={styles.inputSearchStyle}
                                        data={states}
                                        search
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="SELECT STATE"
                                        searchPlaceholder="SEARCH..."
                                        value={form.stateCode}
                                        onFocus={() => setFocusedField('state')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={onStateChange}
                                        containerStyle={styles.dropdownContainer}
                                        itemTextStyle={styles.itemText}
                                        renderRightIcon={() => (
                                            <MaterialIcons
                                                name="expand-more"
                                                size={20}
                                                color={isDark ? '#fff' : '#000'}
                                                style={{ opacity: 0.5 }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            focusedField === 'state_text' && styles.inputFocused
                                        ]}
                                        placeholder="TYPE STATE / AREA NAME"
                                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                        value={form.state}
                                        onFocus={() => setFocusedField('state_text')}
                                        onBlur={() => setFocusedField(null)}
                                        onChangeText={(t) => setForm({ ...form, state: t })}
                                    />
                                )}
                            </View>

                            {/* City Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>CITY</Text>
                                {cities.length > 0 ? (
                                    <Dropdown
                                        style={[
                                            styles.dropdown,
                                            focusedField === 'city' && styles.inputFocused
                                        ]}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        inputSearchStyle={styles.inputSearchStyle}
                                        data={cities}
                                        search
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="SELECT CITY"
                                        searchPlaceholder="SEARCH..."
                                        value={form.city}
                                        onFocus={() => setFocusedField('city')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={onCityChange}
                                        containerStyle={styles.dropdownContainer}
                                        itemTextStyle={styles.itemText}
                                        renderRightIcon={() => (
                                            <MaterialIcons
                                                name="expand-more"
                                                size={20}
                                                color={isDark ? '#fff' : '#000'}
                                                style={{ opacity: 0.5 }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            focusedField === 'city_text' && styles.inputFocused
                                        ]}
                                        placeholder="TYPE CITY NAME"
                                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                        value={form.city}
                                        onFocus={() => setFocusedField('city_text')}
                                        onBlur={() => setFocusedField(null)}
                                        onChangeText={(t) => setForm({ ...form, city: t })}
                                    />
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>STREET ADDRESS</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        focusedField === 'address1' && styles.inputFocused
                                    ]}
                                    placeholder="STREET NAME, BUILDING..."
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                    value={form.address_line_1}
                                    onFocus={() => setFocusedField('address1')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(t) => setForm({ ...form, address_line_1: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        focusedField === 'address2' && styles.inputFocused
                                    ]}
                                    placeholder="APARTMENT, FLOOR... (OPTIONAL)"
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                    value={form.address_line_2}
                                    onFocus={() => setFocusedField('address2')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(t) => setForm({ ...form, address_line_2: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>POSTAL CODE</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        focusedField === 'postal' && styles.inputFocused
                                    ]}
                                    placeholder="0000"
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                    value={form.postal_code}
                                    onFocus={() => setFocusedField('postal')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(t) => setForm({ ...form, postal_code: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>PHONE NUMBER</Text>
                                <View style={[
                                    styles.phoneBox,
                                    focusedField === 'phone' && styles.inputFocused
                                ]}>
                                    <View style={styles.codeIndicator}>
                                        <Text style={styles.codeText}>{form.callingCode ? `+${form.callingCode}` : '+961'}</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <TextInput
                                        style={styles.phoneTextInput}
                                        placeholder="70 000 000"
                                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                        value={form.phone}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        onChangeText={(t) => setForm({ ...form, phone: t })}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={styles.checkboxRow}
                                onPress={() => setForm({ ...form, is_default: !form.is_default })}
                            >
                                <View style={[styles.checkSquare, form.is_default && styles.checkSquareActive]}>
                                    {form.is_default && <MaterialIcons name="check" size={14} color={isDark ? '#000' : '#fff'} />}
                                </View>
                                <Text style={styles.checkLabel}>MAKE THIS MY DEFAULT ADDRESS</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color={isDark ? '#000' : '#fff'} /> : <Text style={styles.submitButtonText}>{editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}</Text>}
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
    },
    titleBold: {
        fontSize: 42,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
        marginTop: -10,
    },
    titleUnderline: {
        width: 40,
        height: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        marginTop: 4,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        opacity: 0.5,
        letterSpacing: 1,
    },
    textInput: {
        height: 56,
        backgroundColor: isDark ? '#000' : '#fff',
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
    inputFocused: {
        borderColor: isDark ? '#fff' : '#000',
    },
    dropdown: {
        height: 56,
        backgroundColor: isDark ? '#000' : '#fff',
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    dropdownContainer: {
        backgroundColor: isDark ? '#111' : '#fff',
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#eee',
        borderRadius: 8,
    },
    itemText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#fff' : '#000',
    },
    placeholderStyle: {
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    },
    selectedTextStyle: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
    inputSearchStyle: {
        height: 48,
        fontSize: 14,
        borderRadius: 8,
        backgroundColor: isDark ? '#222' : '#f9f9f9',
        color: isDark ? '#fff' : '#000',
    },
    iconStyle: {
        width: 24,
        height: 24,
        tintColor: isDark ? '#fff' : '#000',
    },
    phoneBox: {
        height: 56,
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeIndicator: {
        paddingHorizontal: 16,
        height: '100%',
        justifyContent: 'center',
    },
    codeText: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
    divider: {
        width: 2,
        height: '40%',
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    phoneTextInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 4,
    },
    checkSquare: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkSquareActive: {
        backgroundColor: isDark ? '#fff' : '#000',
    },
    checkLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        opacity: 0.5,
    },
    submitButton: {
        height: 64,
        backgroundColor: isDark ? '#fff' : '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        borderRadius: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 2,
    },
    headerTabs: {
        flexDirection: 'row',
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        borderRadius: 24,
        padding: 3,
        marginRight: 8,
        overflow: 'hidden',
    },
    tabItem: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tabItemActive: {
        backgroundColor: isDark ? '#fff' : '#000',
    },
    tabText: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        letterSpacing: 1,
    },
    tabTextActive: {
        color: isDark ? '#000' : '#fff',
    },
    backButton: {
        width: 20,
        height: 20,
        marginHorizontal: 8,
    },
});
