import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useHorario } from '../../hooks/useHorario';
import { useTipo } from '../../hooks/useTipo';

const DIAS_ORDEN = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_LABELS: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', 
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
};

export default function HorarioScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const { horarios, cargarHorarios, eliminarHorario } = useHorario(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        cargarHorarios();
        cargarTipos();
      }
    }, [userId, cargarHorarios, cargarTipos])
  );

  const onRefresh = async () => {
    setRefrescando(true);
    if (userId) {
      await cargarHorarios();
      await cargarTipos();
    }
    setRefrescando(false);
  };

  const handleEliminar = (id: number) => {
    Alert.alert("Eliminar actividad", "¿Estás seguro de eliminar este horario?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => eliminarHorario(id) }
    ]);
  };

  // Agrupar horarios por día
  const horariosPorDia = DIAS_ORDEN.map(dia => ({
    dia,
    items: horarios.filter(h => h.dia === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  })).filter(grupo => grupo.items.length > 0);

  const getTipo = (idTipo: number) => tipos.find(t => t.id === idTipo);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-6 pt-12" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        <Text className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Horario semanal</Text>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Mi horario</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tu semana de lunes a viernes</Text>

        <View className="flex-row items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-4">
          <Feather name="chevron-left" size={20} color="#94a3b8" />
          <Text className="font-bold text-slate-900 dark:text-white">5–9 de octubre, 2026</Text>
          <Feather name="chevron-right" size={20} color="#94a3b8" />
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/crear-actividad')}
          className="bg-indigo-600 py-4 rounded-xl items-center flex-row justify-center mb-6 active:bg-indigo-700 shadow-sm"
        >
          <Feather name="plus" size={18} color="white" />
          <Text className="text-white font-bold text-base ml-2">Agregar actividad</Text>
        </TouchableOpacity>

        <Text className="text-xs text-slate-400 mb-6">Vista semanal · Actividades ordenadas por hora</Text>

        {horariosPorDia.map((grupo) => (
          <View key={grupo.dia} className="mb-6">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{DIAS_LABELS[grupo.dia]}</Text>
            </View>

            {grupo.items.map(horario => {
              const tipo = getTipo(horario.idTipo);
              return (
                <View key={horario.id} className="flex-row mb-4">
                  <View className="w-16 mr-2 mt-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{horario.hora_inicio}</Text>
                    <Text className="text-xs text-slate-500">{horario.hora_fin}</Text>
                  </View>
                  <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                    {/* Al no tener 'nombre' en Horario, mostramos el del Tipo */}
                    <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {tipo?.nombre || 'Actividad sin tipo'}
                    </Text>
                    
                    {tipo && (
                      <View className="bg-indigo-50 dark:bg-indigo-900/30 self-start px-2 py-1 rounded-md mb-4">
                        <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{tipo.nombre}</Text>
                      </View>
                    )}

                    <View className="flex-row gap-x-6">
                      <TouchableOpacity 
                        className="flex-row items-center"
                        onPress={() => router.push({
                          pathname: '/editar-actividad',
                          params: { id: horario.id, idTipo: horario.idTipo, dia: horario.dia, inicio: horario.hora_inicio, fin: horario.hora_fin }
                        })}
                      >
                        <Feather name="edit-2" size={12} color="#4f46e5" />
                        <Text className="text-indigo-600 font-bold text-xs ml-1.5">Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity className="flex-row items-center" onPress={() => handleEliminar(horario.id)}>
                        <Feather name="trash-2" size={12} color="#ef4444" />
                        <Text className="text-red-500 font-bold text-xs ml-1.5">Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}