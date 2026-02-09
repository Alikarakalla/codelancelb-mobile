import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TABS = ['Details', 'Orders', 'Addresses', 'Notifications', 'Loyalty', 'Security'];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff', borderBottomColor: isDark ? '#334155' : '#f3f4f6' }]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <Pressable
                            key={tab}
                            onPress={() => onTabChange(tab)}
                            style={[
                                styles.tab,
                                isActive && styles.activeTab,
                                { borderBottomColor: isActive ? '#18181b' : 'transparent' }
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: isActive ? '#18181b' : (isDark ? '#9ca3af' : '#616f89') },
                                isActive && styles.activeTabText
                            ]}>
                                {tab}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        // Using sticky behavior might require coordination with parent ScrollView or standard View placement
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 24,
    },
    tab: {
        paddingVertical: 12,
        borderBottomWidth: 3,
    },
    activeTab: {
        // Border color handled inline
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '700',
    },
});
