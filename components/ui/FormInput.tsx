import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, Pressable } from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'style' | 'defaultValue'> {
    control: Control<T>;
    name: Path<T>;
    rules?: RegisterOptions<T>;
    label?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    containerStyle?: ViewStyle;
    rightElement?: React.ReactNode;
}

export function FormInput<T extends FieldValues>({
    control,
    name,
    rules,
    label,
    icon,
    containerStyle,
    rightElement,
    ...rest
}: FormInputProps<T>) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={[styles.container, containerStyle]}>
                    {!!label && <Text style={styles.label}>{label}</Text>}

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[
                                styles.input,
                                error ? { borderColor: '#ef4444' } : {},
                                icon ? { paddingRight: 48 } : {},
                                rightElement ? { paddingRight: 48 } : {}
                            ]}
                            placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            {...rest}
                        />

                        {!!(icon && !rightElement) && (
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={icon} size={20} color="#9ca3af" />
                            </View>
                        )}

                        {!!rightElement && (
                            <View style={styles.rightElementContainer}>
                                {rightElement}
                            </View>
                        )}
                    </View>

                    {!!error && (
                        <Text style={styles.errorText}>
                            {error.message || 'This field is required'}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '900', // Ultra bold for modern look
        color: isDark ? '#fff' : '#000',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: 60,
        backgroundColor: isDark ? '#000' : '#fff',
        borderWidth: 2, // Thicker border for modern look
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8, // Softened corners
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 15,
        fontWeight: '600',
        color: isDark ? '#fff' : '#000',
    },
    iconContainer: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    rightElementContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 56,
    },
    errorText: {
        color: '#ff0000',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 6,
        textTransform: 'uppercase',
    }
});
