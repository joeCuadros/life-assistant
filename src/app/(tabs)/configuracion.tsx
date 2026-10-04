import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../db/database';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import { useUsuario } from '../../hooks/useUsuario';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();

  const { logout } = useUsuario();
  const { setColorScheme } = useColorScheme();

  const [userId, setUserId] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<{ nombre: string; correo: string } | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const { config, cargarConfiguracion, guardarConfiguracion } = useConfiguracion(userId);

  // Estados locales para los Inputs
  const [hora, setHora] = useState('09:00');
  const [bloque, setBloque] = useState('30');
  const [descanso, setDescanso] = useState('5');
  const [maximo, setMaximo] = useState('120');

  useEffect(() => {
    const iniciarSesion = async () => {
      try {
        let id = Number(params.idUsuario);
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) id = Number(storedId);

        if (id) {
          setUserId(id);
          const user = await db.getFirstAsync<{ nombre: string; correo: string }>(
            'SELECT nombre, correo FROM Usuario WHERE id = ?', [id]
          );
          if (user) setUsuario(user);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      }
    };
    iniciarSesion();
  }, [params.idUsuario]);

  useEffect(() => {
    const cargar = async () => {
      if (userId) {
        await cargarConfiguracion();
        setCargandoDatos(false);
      }
    };
    cargar();
  }, [userId, cargarConfiguracion]);

  // Cuando la configuración de la BD llega, actualizamos los inputs
  useEffect(() => {
    if (config) {
      setHora(config.hora_predeterminado);
      setBloque(config.bloque_minutos.toString());
      setDescanso(config.descanso_minutos.toString());
      setMaximo(config.maximo_minutos.toString());
    }
  }, [config]);

  const guardarCambios = async () => {
    if (!config) return;

    // Forzamos a que sean enteros y mínimo 1 (no permite 0 ni negativos)
    const valBloque = Math.max(1, parseInt(bloque) || 1);
    const valDescanso = Math.max(1, parseInt(descanso) || 1);
    const valMaximo = Math.max(1, parseInt(maximo) || 1);

    // Corregimos la UI si el usuario dejó vació o puso 0
    setBloque(valBloque.toString());
    setDescanso(valDescanso.toString());
    setMaximo(valMaximo.toString());

    await guardarConfiguracion(config.tema, hora, valBloque, valDescanso, valMaximo);
  };

  const cambiarTema = async (nuevoTema: 'claro' | 'oscuro') => {
    setColorScheme(nuevoTema === 'oscuro' ? 'dark' : 'light');
    await guardarConfiguracion(
      nuevoTema,
      hora,
      parseInt(bloque) || 30,
      parseInt(descanso) || 5,
      parseInt(maximo) || 120
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (cargandoDatos || !usuario) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const isClaro = config?.tema === 'claro';
  const iniciales = usuario.nombre.substring(0, 2).toUpperCase();

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12" showsVerticalScrollIndicator={false}>

      <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Configuración</Text>

      <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8">
        <View className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 justify-center items-center">
          <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{iniciales}</Text>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-base font-bold text-slate-900 dark:text-white">{usuario.nombre}</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">{usuario.correo}</Text>
        </View>
      </View>

      <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Apariencia</Text>
      <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-3">Tema de la aplicación</Text>
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={() => cambiarTema('claro')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${isClaro ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
          >
            <Feather name="sun" size={16} color={isClaro ? '#4f46e5' : '#64748b'} />
            <Text className={`ml-2 text-sm font-medium ${isClaro ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Claro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => cambiarTema('oscuro')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${!isClaro ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
          >
            <Feather name="moon" size={16} color={!isClaro ? '#4f46e5' : '#64748b'} />
            <Text className={`ml-2 text-sm font-medium ${!isClaro ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Oscuro</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Planificación</Text>
      <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">

        <View className="mb-5">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2">Hora para tareas sin hora</Text>
          <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-xl">
            <TextInput
              className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 py-2"
              value={hora}
              onChangeText={setHora}
              onBlur={guardarCambios}
              placeholder="09:00"
            />
          </View>
          <Text className="text-[10px] text-slate-400 mt-2 ml-1">Se usará cuando no elijas una hora.</Text>
        </View>

        <View className="h-[1px] bg-slate-100 dark:bg-slate-700/50 mb-5" />

        <View className="mb-5">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2">Duración de bloques de tiempo</Text>
          <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-xl">
            <TextInput
              className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 py-2"
              keyboardType="numeric"
              value={bloque}
              onChangeText={(text) => setBloque(text.replace(/[^0-9]/g, ''))} // Solo números
              onBlur={guardarCambios}
            />
            <Text className="text-sm font-bold text-slate-500 ml-2">minutos</Text>
          </View>
          <Text className="text-[10px] text-slate-400 mt-2 ml-1">Tiempo de concentración por bloque.</Text>
        </View>

        <View className="h-[1px] bg-slate-100 dark:bg-slate-700/50 mb-5" />

        <View className="mb-5">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2">Duración de descansos</Text>
          <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-xl">
            <TextInput
              className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 py-2"
              keyboardType="numeric"
              value={descanso}
              onChangeText={(text) => setDescanso(text.replace(/[^0-9]/g, ''))}
              onBlur={guardarCambios}
            />
            <Text className="text-sm font-bold text-slate-500 ml-2">minutos</Text>
          </View>
          <Text className="text-[10px] text-slate-400 mt-2 ml-1">Pausa entre bloques de concentración.</Text>
        </View>

        <View className="h-[1px] bg-slate-100 dark:bg-slate-700/50 mb-5" />

        <View>
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2">Duración máxima de planificación</Text>
          <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-xl">
            <TextInput
              className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 py-2"
              keyboardType="numeric"
              value={maximo}
              onChangeText={(text) => setMaximo(text.replace(/[^0-9]/g, ''))}
              onBlur={guardarCambios}
            />
            <Text className="text-sm font-bold text-slate-500 ml-2">minutos</Text>
          </View>
          <Text className="text-[10px] text-slate-400 mt-2 ml-1">Límite total de cada bloque de planificación.</Text>
        </View>

      </View>

      <TouchableOpacity
        onPress={() => router.push('/gestionar-tipos')}
        className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700/50 mb-10"
      >
        <View>
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-1">Gestionar tipos</Text>
          <Text className="text-[10px] text-slate-400">Universidad, Trabajo, Personal y Casa</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-50 dark:bg-red-900/20 py-4 rounded-xl flex-row items-center justify-center mb-3 active:bg-red-100 dark:active:bg-red-900/40"
      >
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text className="text-red-500 font-bold ml-2 text-sm">Cerrar sesión</Text>
      </TouchableOpacity>

      <Text className="text-center text-[10px] text-slate-400 dark:text-slate-500 mb-6">
        Life Assistant · Versión 1.0
      </Text>

      <View className="h-6" />
    </ScrollView>
  );
}