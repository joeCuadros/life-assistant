import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../db/database';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}