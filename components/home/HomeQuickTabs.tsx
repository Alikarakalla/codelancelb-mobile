import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface HomeQuickTabsProps {
    tabs: string[];
    activeTab: string;
    onChange: (tab: string) => void;
}

export function HomeQuickTabs({ tabs, activeTab, onChange }: HomeQuickTabsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.tabList}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <Pressable
                            key={tab}
                            onPress={() => onChange(tab)}
                            style={styles.tabItem}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab}
                            </Text>
                            {isActive && <View style={styles.activeIndicator} />}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    tabList: {
        flexDirection: 'row',
        gap: 32,
    },
    tabItem: {
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280', // brand gray
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    activeTabText: {
        color: '#18181B', // brand black
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -8,
        width: 16,
        height: 2,
        backgroundColor: '#18181B',
    }
});
