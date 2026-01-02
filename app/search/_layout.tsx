import { Stack } from 'expo-router';

export default function SearchLayout() {
    return (
        <Stack
            screenOptions={{
                headerLargeTitle: true,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Search',
                    headerSearchBarOptions: {
                        placeholder: 'Products, Brands, Categories and More',
                        placement: 'automatic',
                        autoCapitalize: 'none',
                        hideWhenScrolling: false,
                    },
                }}
            />
        </Stack>
    );
}
