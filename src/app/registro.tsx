import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUsuario } from '../hooks/useUsuario';

export default function RegisterScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { cargando, crearUsuario } = useUsuario();
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  
  const [mostrarPass1, setMostrarPass1] = useState(false);
  const [mostrarPass2, setMostrarPass2] = useState(false);

  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#94a3b8'; // slate-400

  // Validación visual como en el diseño
  const contraseñasCoinciden = contrasena.length > 0 && contrasena === confirmarContrasena;

  const handleRegistro = async () => {
    if (!nombre || !correo || !contrasena) return alert('Llena todos los campos');
    if (!contraseñasCoinciden) return alert('Las contraseñas no coinciden');
    
    const user = await crearUsuario(nombre, correo, contrasena);
    if (user) {
      router.replace({ pathname: '/inicio', params: { idUsuario: user.id, nombre: user.nombre } });
    } else {
      alert('Error al registrar (¿El correo ya está en uso?)');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Ocultamos la cabecera nativa para dibujarla nosotros */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1 px-8 pt-12" showsVerticalScrollIndicator={false}>
        
        {/* Cabecera con botón atrás */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color={isDark ? 'white' : '#0f172a'} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white ml-2">
            Crear cuenta
          </Text>
        </View>

        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Empieza a organizar tu día
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Un solo lugar para la universidad, el trabajo y tu vida personal.
        </Text>

        {/* Inputs */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Nombre</Text>
          <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-14">
            <TextInput
              className="flex-1 text-slate-900 dark:text-white"
              placeholder="Lucía Martín"
              placeholderTextColor="#94a3b8"
              value={nombre}
              onChangeText={setNombre}
            />
            <Feather name="user" size={20} color={iconColor} />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Correo electrónico</Text>
          <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-14">
            <TextInput
              className="flex-1 text-slate-900 dark:text-white"
              placeholder="lucia.martin@correo.com"
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
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Contraseña</Text>
          <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-14">
            <TextInput
              className="flex-1 text-slate-900 dark:text-white"
              placeholder="••••••••••••"
              placeholderTextColor="#94a3b8"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!mostrarPass1}
            />
            <TouchableOpacity onPress={() => setMostrarPass1(!mostrarPass1)}>
              <Feather name={mostrarPass1 ? "eye" : "eye-off"} size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
          <Text className="text-[10px] text-slate-400 ml-1 mt-2 mb-4">
            Usa al menos 8 caracteres, una letra y un número.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Confirmar contraseña</Text>
          <View className={`flex-row items-center bg-white dark:bg-slate-800 border rounded-xl px-4 h-14 ${contraseñasCoinciden ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'}`}>
            <TextInput
              className="flex-1 text-slate-900 dark:text-white"
              placeholder="••••••••••••"
              placeholderTextColor="#94a3b8"
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              secureTextEntry={!mostrarPass2}
            />
            <TouchableOpacity onPress={() => setMostrarPass2(!mostrarPass2)}>
              <Feather name={mostrarPass2 ? "eye" : "eye-off"} size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mensaje de validación verde */}
        {contraseñasCoinciden && (
          <View className="flex-row items-center border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-6">
            <Feather name="check-circle" size={18} color="#10b981" />
            <Text className="text-emerald-600 dark:text-emerald-400 text-sm ml-2 font-medium">
              Las contraseñas coinciden.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleRegistro}
          disabled={cargando}
          className={`py-4 rounded-xl items-center mb-6 shadow-sm ${cargando ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
        >
          {cargando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-xs text-slate-400 dark:text-slate-500 mb-6 leading-5">
          Al crear tu cuenta aceptas los Términos de uso y la Política de privacidad.
        </Text>

        <TouchableOpacity onPress={() => router.back()} className="mb-12">
          <Text className="text-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            ¿Ya tienes cuenta? Iniciar sesión
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}