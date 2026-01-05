import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LoyaltyRewards } from '@/components/profile/LoyaltyRewards';

export default function RewardsSheet() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Available Rewards</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                 <LoyaltyRewards />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    }
});
