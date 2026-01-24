import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack } from 'expo-router';
import { CountryPicker } from 'react-native-country-codes-picker';
import { useForm, Controller } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth-context';

export default function SignUpScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

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
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        countryName: {
            color: isDark ? '#fff' : '#000',
        },
        dialCode: {
            color: isDark ? '#fff' : '#000',
            opacity: 0.6,
        },
        textInput: {
            color: isDark ? '#fff' : '#000',
            backgroundColor: isDark ? '#111' : '#f3f4f6',
            borderRadius: 8,
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
                ...(data.phone ? {
                    phone: `+${callingCode}${data.phone}`,
                    phone_country: countryCode,
                } : {}),
                referral_code: data.referralCode || undefined,
            };

            await register(payload);

            Alert.alert('Success', 'Account created successfully!', [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Registration Failed', error.message || 'Something went wrong.');
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
                            <Pressable
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <IconSymbol
                                    name="chevron.left"
                                    color={isDark ? '#fff' : '#000'}
                                    size={24}
                                />
                            </Pressable>
                        )
                    }}
                />

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {/* Minimalist Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>SIGN UP</Text>
                            <View style={styles.titleUnderline} />
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <FormInput
                                control={control}
                                name="name"
                                label="NAME"
                                placeholder="YOUR FULL NAME"
                                rules={{ required: 'Full Name is required' }}
                                autoCapitalize="words"
                            />

                            <FormInput
                                control={control}
                                name="email"
                                label="EMAIL"
                                placeholder="YOUR@EMAIL.COM"
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
                                <Text style={styles.label}>PHONE NUMBER</Text>
                                <View style={styles.phoneContainer}>
                                    <Pressable
                                        style={styles.countryCodeBtn}
                                        onPress={() => setCountryPickerVisible(true)}
                                    >
                                        <Text style={styles.countryCodeText}>{callingCode ? `+${callingCode}` : '+1'}</Text>
                                        <MaterialIcons name="arrow-drop-down" size={20} color={isDark ? '#fff' : '#000'} />
                                    </Pressable>
                                    <View style={styles.verticalDivider} />

                                    <Controller
                                        control={control}
                                        name="phone"
                                        rules={{ required: false }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={styles.phoneInput}
                                                placeholder="ENTER PHONE"
                                                placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
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
                                label="PASSWORD"
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                rules={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                                rightElement={
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialIcons
                                            name={showPassword ? "visibility" : "visibility-off"}
                                            size={20}
                                            color={isDark ? "#fff" : "#000"}
                                        />
                                    </Pressable>
                                }
                            />

                            <FormInput
                                control={control}
                                name="confirmPassword"
                                label="CONFIRM PASSWORD"
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
                                            color={isDark ? "#fff" : "#000"}
                                        />
                                    </Pressable>
                                }
                            />

                            <FormInput
                                control={control}
                                name="referralCode"
                                label="REFERRAL CODE (OPTIONAL)"
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
                                                value && { backgroundColor: isDark ? '#fff' : '#000', borderColor: isDark ? '#fff' : '#000' }
                                            ]}
                                        >
                                            {value && <MaterialIcons name="check" size={16} color={isDark ? '#000' : '#fff'} />}
                                        </Pressable>
                                    )}
                                />
                                <Text style={styles.termsText}>
                                    BY CREATING AN ACCOUNT, YOU AGREE TO OUR <Text style={styles.linkText}>TERMS</Text> AND <Text style={styles.linkText}>PRIVACY POLICY</Text>.
                                </Text>
                            </View>

                            {/* Sign Up Button */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.signUpButton,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Text style={styles.signUpButtonText}>CREATING ACCOUNT...</Text>
                                ) : (
                                    <Text style={styles.signUpButtonText}>CREATE ACCOUNT</Text>
                                )}
                            </Pressable>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>ALREADY HAVE AN ACCOUNT?</Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.loginLinkText}>LOG IN</Text>
                            </Pressable>
                        </View>
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
        </KeyboardAvoidingView>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000' : '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    backButton: {
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
    },
    titleUnderline: {
        width: 40,
        height: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        marginTop: 4,
    },
    form: {
        gap: 12,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        marginBottom: 8,
        letterSpacing: 1,
    },
    phoneContainer: {
        height: 60,
        backgroundColor: isDark ? '#000' : '#fff',
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
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
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
    verticalDivider: {
        width: 2,
        height: '40%',
        backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 15,
        fontWeight: '600',
        color: isDark ? '#fff' : '#000',
    },
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
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 10,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        opacity: 0.6,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    linkText: {
        color: isDark ? '#fff' : '#000',
        textDecorationLine: 'underline',
        fontWeight: '900',
    },
    signUpButton: {
        height: 64,
        backgroundColor: isDark ? '#fff' : '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        borderRadius: 8,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 2,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        opacity: 0.4,
        letterSpacing: 1,
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        textTransform: 'uppercase',
        textDecorationLine: 'underline',
    },
});
