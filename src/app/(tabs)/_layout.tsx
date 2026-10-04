import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5', // indigo-600
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopColor: isDark ? '#1e293b' : '#f8fafc',
          borderTopWidth: 1,
          height: 65 + insets.bottom, // <-- 2. Suma el inset a la altura
          paddingBottom: 10 + insets.bottom, // <-- 3. Suma el inset al padding
          paddingTop: 10,
        },
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '600', 
          marginTop: 4 
        }
      }}
    >
      <Tabs.Screen 
        name="inicio" 
        options={{ 
          title: 'Inicio', 
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="tareas" 
        options={{ 
          title: 'Tareas', 
          tabBarIcon: ({ color }) => <Feather name="check-square" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="horario" 
        options={{ 
          title: 'Horario', 
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="configuracion" 
        options={{ 
          title: 'Configuración', 
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}