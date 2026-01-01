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
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#e5e7eb' : '#111318',
        marginBottom: 8,
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
    errorBorder: {
        // We can't apply border directly to View if the input covers it, 
        // but here the View wraps the Input.
        // Actually, we should apply border color to the input if possible, 
        // OR make sure the input bg is transparent? 
        // The current design has border on Input. 
        // Let's refactor: apply style to TextInput in the render function above if needed
        // but easier: just pass error prop or conditional style to TextInput
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
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 56,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
});
