import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTareas } from '../hooks/useTareas';
import { useTipo } from '../hooks/useTipo';

const PRIORIDADES_UI = [
  { id: 'Baja', colorCls: 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600', textCls: 'text-slate-600 dark:text-slate-300', iconColor: '#64748b' },
  { id: 'Media', colorCls: 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700', textCls: 'text-blue-600 dark:text-blue-400', iconColor: '#3b82f6' },
  { id: 'Alta', colorCls: 'bg-orange-50 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700', textCls: 'text-orange-600 dark:text-orange-400', iconColor: '#f97316' },
  { id: 'Urgente', colorCls: 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700', textCls: 'text-red-600 dark:text-red-400', iconColor: '#ef4444' },
];

export default function EditarTareaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tareaId = Number(params.id);

  const [userId, setUserId] = useState<number | null>(null);

  const { tareas, cargarTareas, actualizarTarea, eliminarTarea } = useTareas(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  const [descripcion, setDescripcion] = useState((params.descripcion as string) || '');
  const [idTipo, setIdTipo] = useState<number | null>(params.idTipo ? Number(params.idTipo) : null);
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>((params.prioridad as any) || 'Media');
  
  const [fechaStr, horaStr] = (params.fecha as string || '').split(' ');
  const [fecha, setFecha] = useState(fechaStr || '');
  const [hora, setHora] = useState(horaStr || '');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        cargarTipos();
        cargarTareas(); // Refresca por si agregaste una subtarea
      }
    }, [userId])
  );

  const handleGuardar = async () => {
    if (!descripcion.trim()) return alert('La descripción es obligatoria');
    setGuardando(true);
    const fechaFinal = (fecha || hora) ? `${fecha} ${hora}`.trim() : null;
    
    await actualizarTarea(tareaId, descripcion, prioridad, idTipo, fechaFinal);
    setGuardando(false);
    router.back();
  };

  const handleEliminar = () => {
    Alert.alert("Eliminar tarea", "¿Seguro que quieres eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
          await eliminarTarea(tareaId);
          router.back();
      }}
    ]);
  };

  // Extraer las subtareas que pertenecen a esta tarea principal
  const misSubtareas = tareas.filter(t => t.idTareaPadre === tareaId);

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Editar tarea</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Modificar información</Text>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Descripción</Text>
        <TextInput
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white"
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tipo</Text>
        <View className="flex-row flex-wrap gap-2">
          {tipos.map(t => (
            <TouchableOpacity 
              key={t.id} onPress={() => setIdTipo(t.id)}
              className={`px-4 py-3 rounded-xl border ${idTipo === t.id ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/40' : 'bg-white border-slate-200 dark:bg-slate-800'}`}
            >
              <Text className={`text-sm font-medium ${idTipo === t.id ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>{t.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Prioridad</Text>
        <View className="flex-row justify-between">
          {PRIORIDADES_UI.map(p => {
            const isSelected = prioridad === p.id;
            return (
              <TouchableOpacity 
                key={p.id} onPress={() => setPrioridad(p.id as any)}
                className={`flex-1 py-3 items-center rounded-xl mx-1 border ${isSelected ? p.colorCls : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
              >
                <Feather name="flag" size={14} color={isSelected ? p.iconColor : '#94a3b8'} />
                <Text className={`text-xs font-bold mt-1 ${isSelected ? p.textCls : 'text-slate-500'}`}>{p.id}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View className="flex-row justify-between gap-x-4 mb-4">
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Fecha</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center">
            <TextInput className="text-slate-900 dark:text-white text-base w-full" value={fecha} onChangeText={setFecha} />
            <Feather name="calendar" size={16} color="#94a3b8" className="absolute right-4" />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Hora</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center">
            <TextInput className="text-slate-900 dark:text-white text-base w-full" value={hora} onChangeText={setHora} />
            <Feather name="clock" size={16} color="#94a3b8" className="absolute right-4" />
          </View>
        </View>
      </View>

      {/* SECCIÓN DE SUBTAREAS VINCULADAS */}
      <View className="mb-8 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold text-slate-900 dark:text-white ml-1">Subtareas de esta tarea</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/nueva-tarea', params: { idTareaPadre: tareaId } })}>
            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-1">+ Crear</Text>
          </TouchableOpacity>
        </View>
        
        {misSubtareas.length === 0 ? (
          <Text className="text-xs text-slate-500 ml-1">No hay subtareas vinculadas a esta.</Text>
        ) : (
          misSubtareas.map(sub => (
            <TouchableOpacity 
              key={sub.id} 
              onPress={() => router.push({ pathname: '/editar-tarea', params: { id: sub.id, descripcion: sub.descripcion, prioridad: sub.prioridad, idTipo: sub.idTipo, fecha: sub.fecha } })}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-2 border border-slate-100 dark:border-slate-700/50 flex-row justify-between items-center shadow-sm"
            >
              <View>
                <Text className={`text-sm font-bold ${sub.completado ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{sub.descripcion}</Text>
                <Text className="text-xs text-slate-500">{sub.completado ? 'Completada' : 'Pendiente'}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity 
        onPress={handleGuardar} disabled={guardando}
        className={`py-4 rounded-xl items-center flex-row justify-center mb-4 shadow-sm ${guardando ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
      >
        {guardando ? <ActivityIndicator color="white" /> : (
          <><Feather name="check" size={18} color="white" /><Text className="text-white font-bold text-base ml-2">Guardar cambios</Text></>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleEliminar} className="bg-red-50 dark:bg-red-900/20 py-4 rounded-xl flex-row items-center justify-center mb-12">
        <Feather name="trash-2" size={18} color="#ef4444" />
        <Text className="text-red-500 font-bold text-base ml-2">Eliminar tarea</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}