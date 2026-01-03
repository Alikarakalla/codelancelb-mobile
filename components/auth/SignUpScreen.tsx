import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack } from 'expo-router';
import { CountryPicker } from 'react-native-country-codes-picker';
import { useForm, Controller } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useDrawer } from '@/hooks/use-drawer-context';
import { useAuth } from '@/hooks/use-auth-context';

export default function SignUpScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const { openDrawer } = useDrawer();

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            referralCode: '',
            agreeToTerms: false,
        }
    });

    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('1');
    const [loading, setLoading] = useState(false);
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const pwd = watch('password');

    // Auto-detect country based on IP
    React.useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code && data.country_calling_code) {
                    setCountryCode(data.country_code);
                    setCallingCode(data.country_calling_code.replace('+', ''));
                }
            } catch (error) {
                console.log('Error fetching location:', error);
            }
        };
        fetchLocation();
    }, []);

    const countryPickerStyle = React.useMemo(() => ({
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
    }), [isDark]);

    const { register, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated]);

    const onSubmit = async (data: any) => {
        if (!data.agreeToTerms) {
            Alert.alert('Terms of Service', 'Please agree to the Terms of Service and Privacy Policy.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.confirmPassword, // Field required by Laravel
                phone: `+${callingCode}${data.phone}`,
                phone_country: countryCode,
                referral_code: data.referralCode || undefined,
            };

            await register(payload);

            Alert.alert('Success', 'Account created successfully!', [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        } catch (error: any) {
            console.error('Registration Error Details:', error);
            const errorMessage = error.message?.includes('422')
                ? 'The email or phone number is already taken, or information is invalid.'
                : 'Server Error (500). Please check your Laravel logs or ensure HasApiTokens is added to User model.';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#101622' : '#f6f6f8' }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    ...Platform.select({
                        ios: {
                            headerLeft: () => (
                                <Pressable
                                    onPress={() => router.back()}
                                    style={styles.nativeGlassWrapper}
                                >
                                    <IconSymbol
                                        name="chevron.left"
                                        color={isDark ? '#fff' : '#000'}
                                        size={24}
                                        weight="medium"
                                    />
                                </Pressable>
                            ),
                            unstable_nativeHeaderOptions: {
                                headerBackground: {
                                    material: 'glass',
                                },
                            }
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

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20, paddingTop: 60 + insets.top }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Headline Section */}
                <View style={styles.headline}>
                    <Text style={styles.headlineText}>Create Account</Text>
                    <Text style={styles.subheadText}>Start shopping the latest trends today.</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <FormInput
                        control={control}
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                        icon="person-outline"
                        rules={{ required: 'Full Name is required' }}
                        autoCapitalize="words"
                    />

                    <FormInput
                        control={control}
                        name="email"
                        label="Email Address"
                        placeholder="hello@example.com"
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        }}
                    />

                    {/* Phone - With Country Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[
                            styles.phoneContainer,
                            isDark && styles.phoneContainerDark,
                        ]}>
                            <Pressable
                                style={styles.countryCodeBtn}
                                onPress={() => setCountryPickerVisible(true)}
                            >
                                <Text style={styles.countryCodeText}>{callingCode ? `+${callingCode}` : '+1'}</Text>
                                <MaterialIcons name="arrow-drop-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </Pressable>
                            <View style={[styles.verticalDivider, isDark && { backgroundColor: '#374151' }]} />

                            <Controller
                                control={control}
                                name="phone"
                                rules={{ required: false }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="Enter phone number"
                                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        keyboardType="phone-pad"
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <FormInput
                        control={control}
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
                        rightElement={
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons
                                    name={showPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#9ca3af"
                                />
                            </Pressable>
                        }
                    />

                    <FormInput
                        control={control}
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="••••••••"
                        secureTextEntry={!showConfirmPassword}
                        rules={{
                            required: 'Please confirm your password',
                            validate: value => value === pwd || 'Passwords do not match'
                        }}
                        rightElement={
                            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <MaterialIcons
                                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#9ca3af"
                                />
                            </Pressable>
                        }
                    />

                    <FormInput
                        control={control}
                        name="referralCode"
                        label="Referral Code (Optional)"
                        placeholder="ENTER CODE"
                        autoCapitalize="characters"
                    />

                    {/* Terms Check */}
                    <View style={styles.termsContainer}>
                        <Controller
                            control={control}
                            name="agreeToTerms"
                            rules={{ required: 'You must agree to the terms' }}
                            render={({ field: { onChange, value } }) => (
                                <Pressable
                                    onPress={() => onChange(!value)}
                                    style={[
                                        styles.checkbox,
                                        value && { backgroundColor: '#000', borderColor: '#000' }
                                    ]}
                                >
                                    {value && <MaterialIcons name="check" size={16} color="#fff" />}
                                </Pressable>
                            )}
                        />
                        <Text style={styles.termsText}>
                            I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                        </Text>
                    </View>

                    {/* Sign Up Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.primaryButtonPressed
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.primaryButtonText}>Creating Account...</Text>
                        ) : (
                            <Text style={styles.primaryButtonText}>Sign Up</Text>
                        )}
                    </Pressable>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerTextWrapper}>
                        <Text style={styles.dividerText}>Or continue with</Text>
                    </View>
                </View>

                {/* Social Buttons */}
                <View style={styles.socialRow}>
                    <Pressable style={styles.socialButton}>
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={{ width: 20, height: 20 }} />
                        <Text style={styles.socialButtonText}>Google</Text>
                    </Pressable>
                    <Pressable style={styles.socialButton}>
                        <MaterialIcons name="apple" size={24} color={isDark ? '#fff' : '#000'} />
                        <Text style={styles.socialButtonText}>Apple</Text>
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Pressable onPress={() => router.push('/login')}>
                        <Text style={styles.linkText}>Log In</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Country Picker Modal */}
            <CountryPicker
                show={countryPickerVisible}
                lang={'en'}
                pickerButtonOnPress={(item) => {
                    setCountryCode(item.code);
                    setCallingCode(item.dial_code.replace('+', ''));
                    setCountryPickerVisible(false);
                }}
                onBackdropPress={() => setCountryPickerVisible(false)}
                style={countryPickerStyle}
            />
        </View>
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
        paddingBottom: 12,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headline: {
        paddingVertical: 24,
    },
    headlineText: {
        fontSize: 32,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        lineHeight: 40,
    },
    subheadText: {
        fontSize: 16,
        color: isDark ? '#9ca3af' : '#616f89',
        marginTop: 8,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#e5e7eb' : '#111318',
    },
    optionalLabel: {
        fontSize: 12,
        color: '#616f89',
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: 56,
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#dbdfe6',
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 16,
        color: isDark ? '#fff' : '#111318',
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 56,
        width: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Phone styles
    phoneContainer: {
        height: 56, // Match other inputs
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#dbdfe6',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneContainerDark: {
        backgroundColor: '#1a2230',
        borderColor: '#374151',
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
        fontSize: 16,
        color: isDark ? '#fff' : '#111827',
    },
    // End Phone styles
    termsContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#dbdfe6',
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
        lineHeight: 20,
    },
    linkText: {
        fontWeight: '700',
        color: '#000',
    },
    primaryButton: {
        height: 56,
        backgroundColor: '#000',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    nativeGlassWrapper: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    dividerRow: {
        position: 'relative',
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
    },
    dividerTextWrapper: {
        backgroundColor: isDark ? '#101622' : '#f6f6f8',
        paddingHorizontal: 8,
    },
    dividerText: {
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        height: 52,
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#dbdfe6',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#fff' : '#111318',
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: isDark ? '#9ca3af' : '#616f89',
    },
});
