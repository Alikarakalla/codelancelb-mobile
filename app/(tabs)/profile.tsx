import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LuxeHeader } from '@/components/home/LuxeHeader';
import { useDrawer } from '@/hooks/use-drawer-context';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { openDrawer } = useDrawer();

    return (
        <View style={styles.container}>
            <LuxeHeader
                title="LUXE"
                onOpenMenu={openDrawer}
            />

            <View style={[styles.content, { paddingTop: 60 + insets.top }]}>
                <Text style={styles.text}>Profile Screen</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
});
