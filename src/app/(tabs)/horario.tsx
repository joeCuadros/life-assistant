import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useHorario } from '../../hooks/useHorario';
import { useTipo } from '../../hooks/useTipo';

// Array actualizado con todos los días de la semana
const DIAS = [
  { key: 'lunes', label: 'Lun', nombre: 'Lunes' }, 
  { key: 'martes', label: 'Mar', nombre: 'Martes' },
  { key: 'miercoles', label: 'Mié', nombre: 'Miércoles' }, 
  { key: 'jueves', label: 'Jue', nombre: 'Jueves' },
  { key: 'viernes', label: 'Vie', nombre: 'Viernes' }, 
  { key: 'sabado', label: 'Sáb', nombre: 'Sábado' },
  { key: 'domingo', label: 'Dom', nombre: 'Domingo' },
];

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

  const getTipo = (idTipo: number) => tipos.find(t => t.id === idTipo);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-6 pt-12" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        {/* Cabecera Principal */}
        <Text className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Horario semanal</Text>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Mi horario</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tu semana de lunes a domingo</Text>

        {/* Indicador de semana */}
        <View className="flex-row items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8">
          <Feather name="calendar" size={20} color="#4f46e5" />
          <Text className="font-bold text-slate-900 dark:text-white">Vista completa de la semana</Text>
          <Feather name="chevron-down" size={20} color="#94a3b8" />
        </View>

        {/* Renderizado de todos los días de la semana */}
        {DIAS.map((diaInfo) => {
          // Filtramos y ordenamos los horarios de este día específico
          const horariosDelDia = horarios
            .filter(h => h.dia === diaInfo.key)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

          return (
            <View key={diaInfo.key} className="mb-6">
              
              {/* Título del día */}
              <View className="flex-row justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4">
                <Text className="text-xl font-bold text-slate-900 dark:text-white">{diaInfo.nombre}</Text>
                <View className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{diaInfo.label}</Text>
                </View>
              </View>

              {/* Si no hay actividades, mostramos un texto sutil */}
              {horariosDelDia.length === 0 ? (
                <Text className="text-sm text-slate-400 italic mb-4 ml-1">Sin actividades programadas.</Text>
              ) : (
                /* Si hay actividades, las listamos */
                horariosDelDia.map(horario => {
                  const tipo = getTipo(horario.idTipo);
                  return (
                    <View key={horario.id} className="flex-row mb-4">
                      <View className="w-16 mr-2 mt-1">
                        <Text className="text-sm font-bold text-slate-900 dark:text-white">{horario.hora_inicio}</Text>
                        <Text className="text-xs text-slate-500">{horario.hora_fin}</Text>
                      </View>
                      
                      <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
                          {tipo?.nombre || 'Actividad sin tipo'}
                        </Text>
                        
                        {tipo && (
                          <View className="bg-indigo-50 dark:bg-indigo-900/30 self-start px-2 py-1 rounded-md mb-4 flex-row items-center">
                            <Feather name={(tipo.icono as any) || 'box'} size={10} color="#4f46e5" />
                            <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400 ml-1.5">{tipo.nombre}</Text>
                          </View>
                        )}

                        <View className="flex-row gap-x-6 border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
                          <TouchableOpacity 
                            className="flex-row items-center"
                            onPress={() => router.push({
                              pathname: '/editar-actividad',
                              params: { id: horario.id, idTipo: horario.idTipo, dia: horario.dia, inicio: horario.hora_inicio, fin: horario.hora_fin }
                            })}
                          >
                            <Feather name="edit-2" size={14} color="#4f46e5" />
                            <Text className="text-indigo-600 font-bold text-xs ml-1.5">Editar</Text>
                          </TouchableOpacity>

                          <TouchableOpacity className="flex-row items-center" onPress={() => handleEliminar(horario.id)}>
                            <Feather name="trash-2" size={14} color="#ef4444" />
                            <Text className="text-red-500 font-bold text-xs ml-1.5">Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          );
        })}

        <View className="h-32" />
      </ScrollView>

      {/* Botón Flotante (FAB) idéntico al de Tareas */}
      <TouchableOpacity 
        onPress={() => router.push('/crear-actividad')}
        className="absolute bottom-6 right-6 bg-indigo-600 px-6 py-4 rounded-full shadow-lg flex-row items-center active:bg-indigo-700"
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}