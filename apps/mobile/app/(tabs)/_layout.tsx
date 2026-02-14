import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSub,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }: TabBarIconProps) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {focused ? '🏠' : '🏡'}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ focused }: TabBarIconProps) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {focused ? '📊' : '📈'}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: 'リーグ',
          tabBarIcon: ({ focused }: TabBarIconProps) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {focused ? '🏆' : '🥇'}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ focused }: TabBarIconProps) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {focused ? '⚙️' : '🔧'}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
});
