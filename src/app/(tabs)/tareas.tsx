import { Feather } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import TareaItem from '../../components/TareaItem';
import { useTareas } from '../../hooks/useTareas';

const FiltroBadge = ({ label, value }: any) => (
  <TouchableOpacity className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mr-2 mb-2 shadow-sm">
    <Text className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</Text>
    <View className="flex-row justify-between items-center">
      <Text className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</Text>
      <Feather name="chevron-down" size={16} color="#94a3b8" />
    </View>
  </TouchableOpacity>
);

export default function TareasScreen() {
  const { idUsuario } = useGlobalSearchParams();
  const userId = Number(idUsuario);
  
  const { tareas, cargarTareas, marcarCompletada } = useTareas(userId);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarTareas();
    setRefrescando(false);
  };

  const pendientes = tareas.filter(t => !t.completado);
  const completadas = tareas.filter(t => t.completado);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-6 pt-12" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-4xl font-bold text-slate-900 dark:text-white">Mis tareas</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {pendientes.length} pendientes · {completadas.length} completadas
            </Text>
          </View>
          <TouchableOpacity className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
            <Feather name="search" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-1">
          <FiltroBadge label="Fecha" value="Todas las fechas" />
          <FiltroBadge label="Prioridad" value="Todas" />
        </View>
        <View className="flex-row mb-8">
          <FiltroBadge label="Tipo" value="Todos los tipos" />
          <FiltroBadge label="Estado" value="Todos" />
        </View>

        <View className="flex-row justify-between items-center mb-4 mt-2">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Pendientes</Text>
          <Text className="text-xs font-bold text-indigo-500">Por fecha ↑</Text>
        </View>
        
        {pendientes.map(tarea => (
          <TareaItem key={tarea.id} tarea={tarea} onToggle={marcarCompletada} />
        ))}

        {completadas.length > 0 && (
          <>
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4 mt-8">
              Completadas · {completadas.length}
            </Text>
            {completadas.map(tarea => (
              <TareaItem key={tarea.id} tarea={tarea} onToggle={marcarCompletada} />
            ))}
          </>
        )}
        <View className="h-32" /> 
      </ScrollView>

      <TouchableOpacity className="absolute bottom-6 right-6 bg-indigo-600 px-6 py-4 rounded-full shadow-lg flex-row items-center active:bg-indigo-700">
        <Feather name="plus" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-base">Nueva tarea</Text>
      </TouchableOpacity>
    </View>
  );
}