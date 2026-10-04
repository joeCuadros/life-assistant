import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTipo } from '../hooks/useTipo';

export default function GestionarTiposScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  
  const { tipos, cargarTipos, eliminarTipo } = useTipo(userId);

  // 1. Obtener el ID del usuario al montar la pantalla
  useEffect(() => {
    const obtenerId = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) setUserId(Number(storedId));
    };
    obtenerId();
  }, []);

  // 2. Auto-recarga: Se dispara cada vez que la pantalla vuelve a tener el foco
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        cargarTipos();
      }
    }, [userId, cargarTipos])
  );

  // 3. Recarga manual: Para el "pull-to-refresh"
  const onRefresh = async () => {
    setRefrescando(true);
    if (userId) await cargarTipos();
    setRefrescando(false);
  };

  const handleEliminar = (id: number, nombre: string) => {
    Alert.alert(
      "Eliminar tipo",
      `¿Estás seguro de eliminar el tipo "${nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarTipo(id) }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-6 pt-12" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        
        {/* Cabecera */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Tus tipos</Text>
        </View>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6 ml-10">Organiza por áreas de tu vida</Text>

        <Text className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-5">
          Usa los mismos tipos para tus tareas y tu horario. Edita un nombre o crea uno nuevo.
        </Text>

        {/* Lista de Tipos */}
        {tipos.map((tipo) => (
          <View key={tipo.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl items-center justify-center">
                <Feather name={(tipo.icono as any) || 'box'} size={20} color="#4f46e5" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">{tipo.nombre}</Text>
                <Text className="text-xs text-slate-400">Tipo guardado</Text>
              </View>
            </View>

            {/* Botones de acción */}
            <View className="flex-row gap-x-6 ml-16">
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => router.push({
                  pathname: '/editar-tipo',
                  params: { id: tipo.id, nombre: tipo.nombre, icono: tipo.icono }
                })}
              >
                <Feather name="edit-2" size={14} color="#4f46e5" />
                <Text className="text-indigo-600 font-bold text-sm ml-1.5">Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center" onPress={() => handleEliminar(tipo.id, tipo.nombre)}>
                <Feather name="trash-2" size={14} color="#ef4444" />
                <Text className="text-red-500 font-bold text-sm ml-1.5">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="h-32" />
      </ScrollView>

      {/* Footer Fijo */}
      <View className="absolute bottom-0 w-full bg-slate-50 dark:bg-slate-900 pt-4 pb-8 px-6">
        <TouchableOpacity 
          onPress={() => router.push('/crear-tipo')}
          className="bg-indigo-600 py-4 rounded-xl items-center mb-4 active:bg-indigo-700 shadow-sm"
        >
          <Text className="text-white font-bold text-base">+ Crear tipo</Text>
        </TouchableOpacity>
        <Text className="text-center text-xs text-slate-400">
          Al eliminar un tipo, tus tareas y actividades se conservan.
        </Text>
      </View>
    </View>
  );
}