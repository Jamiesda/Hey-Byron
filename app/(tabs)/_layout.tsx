// app/(tabs)/_layout.tsx

import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={({
        route,
      }: {
        route: { name: string };
      }) => ({
        headerShown: false,
        // dark background theme with increased height
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopWidth: 1,
          borderTopColor: '#222222',
          height: 70,         // increased from 60 to 70
          paddingBottom: 10,  // added extra bottom padding
          elevation: 4,
        },
        tabBarShowLabel: false,
        // bright accent on dark background
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#888888',
        tabBarIcon: ({
          color,
          size,
        }: {
          color: string;
          size: number;
        }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          if (route.name === 'index') {
            iconName = 'list-outline';
          } else if (route.name === 'calendar') {
            iconName = 'calendar-outline';
          } else if (route.name === 'explore/index') {
            iconName = 'search-outline';
          } else if (route.name === 'interests') {
            iconName = 'heart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* What’s On tab (default route) */}
      <Tabs.Screen
        name="index"
        options={{ title: "What's On" }}
        listeners={{
          tabPress: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            router.push('/');
          },
        }}
      />

      {/* Calendar tab */}
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar' }}
      />

      {/* Explore tab */}
      <Tabs.Screen
        name="explore/index"
        options={{ title: 'Explore' }}
      />

      {/* Interests tab */}
      <Tabs.Screen
        name="interests"
        options={{ title: 'Interests' }}
      />
    </Tabs>
  );
}
