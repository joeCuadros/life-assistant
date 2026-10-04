import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUsuario } from '../hooks/useUsuario';

export default function LoginScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { cargando, login } = useUsuario();
  
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#94a3b8'; // slate-400

  const handleLogin = async () => {
    if (!correo || !contrasena) return alert('Ingresa tu correo y contraseña');
    const user = await login(correo, contrasena);
    if (user) {
      router.replace({ pathname: '/inicio', params: { idUsuario: user.id, nombre: user.nombre } });
    } else {
      alert('Credenciales incorrectas');
    }
  };

  if (cargando) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-8 bg-slate-50 dark:bg-slate-900 justify-center">
      
      {/* Cabecera y Logo */}
      <View className="items-center mb-10 mt-10">
        <View className="bg-indigo-600 w-16 h-16 rounded-2xl items-center justify-center mb-4">
          <Feather name="check-square" size={32} color="white" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Life Assistant
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Tu día, con un poco más de claridad.
        </Text>
      </View>

      <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
        Qué bueno verte
      </Text>

      {/* Formulario */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
          Correo electrónico
        </Text>
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-14">
          <TextInput
            className="flex-1 text-slate-900 dark:text-white"
            placeholder="joe.cuadros@correo.com"
            placeholderTextColor="#94a3b8"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Feather name="mail" size={20} color={iconColor} />
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
          Contraseña
        </Text>
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-14">
          <TextInput
            className="flex-1 text-slate-900 dark:text-white"
            placeholder="••••••••••••"
            placeholderTextColor="#94a3b8"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry={!mostrarPassword}
          />
          <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
            <Feather name={mostrarPassword ? "eye" : "eye-off"} size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity className="mb-8">
        <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      {/* Botones */}
      <TouchableOpacity 
        onPress={handleLogin}
        className="bg-indigo-600 py-4 rounded-xl items-center mb-6 shadow-sm active:bg-indigo-700"
      >
        <Text className="text-white font-bold text-base">
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-slate-500 dark:text-slate-400 mb-4">
        ¿Aún no tienes cuenta?
      </Text>

      <TouchableOpacity 
        onPress={() => router.push('/registro')}
        className="bg-indigo-50 dark:bg-indigo-900/30 py-4 rounded-xl items-center mb-8 border border-indigo-100 dark:border-indigo-800/50"
      >
        <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
          Crear cuenta
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-xs text-slate-400 dark:text-slate-500 mt-auto mb-6">
        Tareas, horarios y tiempo para ti.
      </Text>

    </View>
  );
}