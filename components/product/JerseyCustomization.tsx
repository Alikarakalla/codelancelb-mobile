import React, { useRef } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface JerseyCustomizationProps {
    name: string;
    number: string;
    onChangeName: (value: string) => void;
    onChangeNumber: (value: string) => void;
    errorMessage?: string | null;
}

const QUICK_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function getNameFontSize(name: string) {
    const len = name.length;
    if (len > 14) return 9;
    if (len > 10) return 11;
    if (len > 7) return 13;
    return 15;
}

export function JerseyCustomization({
    name,
    number,
    onChangeName,
    onChangeNumber,
    errorMessage,
}: JerseyCustomizationProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const chipScrollRef = useRef<ScrollView>(null);

    const hasNameError = !!errorMessage && !name.trim();
    const hasNumberError = !!errorMessage && !number.trim();
    const displayName = (name || 'YOUR NAME').toUpperCase();
    const displayNumber = number || '00';
    const nameOpacity = name ? 1 : 0.25;
    const numberOpacity = number ? 1 : 0.25;
    const nameFontSize = getNameFontSize(name);

    return (
        <Animated.View entering={FadeInDown.duration(450)} style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Personalize Your Jersey</Text>
                <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>Customization +$0.00</Text>
                </View>
            </View>

            <View style={styles.inputsRow}>
                <View style={styles.nameField}>
                    <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>NAME</Text>
                    <TextInput
                        value={name}
                        onChangeText={onChangeName}
                        placeholder="Enter your name"
                        placeholderTextColor="#A8AFB8"
                        maxLength={20}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        style={[
                            styles.input,
                            styles.nameInput,
                            isDark && styles.inputDark,
                            hasNameError && styles.inputError,
                        ]}
                    />
                </View>
                <View style={styles.numberField}>
                    <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>NUMBER</Text>
                    <TextInput
                        value={number}
                        onChangeText={(v) => onChangeNumber(v.replace(/[^0-9]/g, ''))}
                        placeholder="No."
                        placeholderTextColor="#A8AFB8"
                        maxLength={2}
                        keyboardType="number-pad"
                        style={[
                            styles.input,
                            styles.numberInput,
                            isDark && styles.inputDark,
                            hasNumberError && styles.inputError,
                        ]}
                    />
                </View>
            </View>

            <View style={styles.chipsRow}>
                <Pressable
                    onPress={() => chipScrollRef.current?.scrollTo({ x: 0, animated: true })}
                    style={[styles.chipNav, isDark && styles.chipNavDark]}
                    hitSlop={6}
                >
                    <Text style={[styles.chipNavText, isDark && styles.chipNavTextDark]}>‹</Text>
                </Pressable>
                <ScrollView
                    ref={chipScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsTrack}
                >
                    {QUICK_NUMBERS.map((n) => {
                        const selected = number === n;
                        return (
                            <Pressable
                                key={n}
                                onPress={() => onChangeNumber(n)}
                                style={[
                                    styles.chip,
                                    isDark && styles.chipDark,
                                    selected && styles.chipSelected,
                                    selected && isDark && styles.chipSelectedDark,
                                ]}
                            >
                                <Text style={[styles.chipText, isDark && styles.chipTextDark]}>{n}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
                <Pressable
                    onPress={() => chipScrollRef.current?.scrollToEnd({ animated: true })}
                    style={[styles.chipNav, isDark && styles.chipNavDark]}
                    hitSlop={6}
                >
                    <Text style={[styles.chipNavText, isDark && styles.chipNavTextDark]}>›</Text>
                </Pressable>
            </View>

            {!!errorMessage && (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
                <View style={styles.previewStripe} />
                <Text style={[styles.previewEyebrow, isDark && styles.previewEyebrowDark]}>PREVIEW</Text>

                <Svg viewBox="0 0 280 300" width={140} height={150} style={styles.previewSvg}>
                    <Path
                        d="M 124,48 C 102,50 78,58 62,68 C 40,80 14,96 6,106 C 2,118 8,132 24,134 L 62,130 L 62,262 Q 62,272 72,272 L 208,272 Q 218,272 218,262 L 218,130 L 256,134 C 272,132 278,118 274,106 C 266,96 240,80 218,68 C 202,58 178,50 156,48 C 150,60 130,60 124,48 Z"
                        fill="#1e293b"
                        stroke="#2d3f55"
                        strokeWidth={0.6}
                    />
                    <Path
                        d="M 124,48 C 130,60 150,60 156,48 C 150,36 140,32 140,32 C 140,32 130,36 124,48 Z"
                        fill="#f59e0b"
                        stroke="#d97706"
                        strokeWidth={0.5}
                    />
                    <Line x1="124" y1="48" x2="62" y2="68" stroke="#2d3f55" strokeWidth={1} opacity={0.6} />
                    <Line x1="156" y1="48" x2="218" y2="68" stroke="#2d3f55" strokeWidth={1} opacity={0.6} />
                    <Path d="M 6,106 C 2,118 8,132 24,134 L 28,124 C 16,122 12,112 14,104 Z" fill="#f59e0b" opacity={0.85} />
                    <Path d="M 274,106 C 278,118 272,132 256,134 L 252,124 C 264,122 268,112 266,104 Z" fill="#f59e0b" opacity={0.85} />
                    <Line x1="140" y1="68" x2="140" y2="272" stroke="#151e2d" strokeWidth={0.4} opacity={0.15} />

                    <SvgText
                        x="140"
                        y="108"
                        textAnchor="middle"
                        fontFamily="Impact"
                        fontSize={nameFontSize}
                        fontWeight="800"
                        fill="#ffffff"
                        stroke="rgba(17,24,39,0.38)"
                        strokeWidth={0.7}
                        opacity={nameOpacity}
                        letterSpacing={1.1}
                    >
                        {displayName}
                    </SvgText>

                    <SvgText
                        x="140"
                        y="210"
                        textAnchor="middle"
                        fontFamily="Impact"
                        fontSize={68}
                        fontWeight="900"
                        fill="#ffffff"
                        stroke="rgba(17,24,39,0.42)"
                        strokeWidth={1.5}
                        opacity={numberOpacity}
                        letterSpacing={2}
                    >
                        {displayNumber}
                    </SvgText>
                </Svg>

                {!name && !number ? (
                    <Text style={[styles.previewHint, isDark && styles.previewHintDark]}>
                        Type above to see your personalization
                    </Text>
                ) : (
                    <View style={styles.previewSuccess}>
                        <Ionicons name="checkmark" size={14} color="#059669" />
                        <Text style={styles.previewSuccessText}>Looking great!</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: 0.3,
    },
    labelDark: {
        color: '#F8FAFC',
    },
    freeBadge: {
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
        backgroundColor: '#F0FDF4',
    },
    freeBadgeText: {
        color: '#15803D',
        fontSize: 11,
        fontWeight: '700',
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    nameField: {
        flex: 1,
    },
    numberField: {
        width: 100,
    },
    fieldLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#6B7280',
        marginBottom: 6,
        fontWeight: '600',
    },
    fieldLabelDark: {
        color: '#94A3B8',
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        color: '#111827',
    },
    inputDark: {
        borderColor: '#1F2937',
        backgroundColor: '#0B1220',
        color: '#F8FAFC',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    nameInput: {
        fontWeight: '600',
        letterSpacing: 1,
    },
    numberInput: {
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
    },
    chipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -4,
    },
    chipNav: {
        width: 28,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipNavDark: {
        borderColor: '#1F2937',
        backgroundColor: '#0B1220',
    },
    chipNavText: {
        fontSize: 18,
        color: '#374151',
        lineHeight: 18,
    },
    chipNavTextDark: {
        color: '#94A3B8',
    },
    chipsTrack: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 2,
    },
    chip: {
        minWidth: 38,
        paddingHorizontal: 10,
        height: 32,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipDark: {
        borderColor: '#1F2937',
        backgroundColor: '#0B1220',
    },
    chipSelected: {
        borderColor: '#111827',
        backgroundColor: '#F9FAFB',
    },
    chipSelectedDark: {
        borderColor: '#F8FAFC',
        backgroundColor: '#1F2937',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },
    chipTextDark: {
        color: '#F8FAFC',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#DC2626',
        fontWeight: '500',
    },
    previewCard: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    previewCardDark: {
        backgroundColor: '#0B1220',
        borderColor: '#1F2937',
    },
    previewStripe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#1E293B',
    },
    previewEyebrow: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#9CA3AF',
        marginBottom: 10,
        fontWeight: '600',
    },
    previewEyebrowDark: {
        color: '#64748B',
    },
    previewSvg: {
        alignSelf: 'center',
    },
    previewHint: {
        marginTop: 8,
        fontSize: 11,
        color: '#9CA3AF',
    },
    previewHintDark: {
        color: '#64748B',
    },
    previewSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    previewSuccessText: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '500',
    },
});
