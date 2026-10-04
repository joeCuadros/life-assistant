import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTareas } from '../hooks/useTareas';
import { useTipo } from '../hooks/useTipo';

const PRIORIDADES_UI = [
  { id: 'Baja', colorCls: 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600', textCls: 'text-slate-600 dark:text-slate-300', iconColor: '#64748b' },
  { id: 'Media', colorCls: 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700', textCls: 'text-blue-600 dark:text-blue-400', iconColor: '#3b82f6' },
  { id: 'Alta', colorCls: 'bg-orange-50 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700', textCls: 'text-orange-600 dark:text-orange-400', iconColor: '#f97316' },
  { id: 'Urgente', colorCls: 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700', textCls: 'text-red-600 dark:text-red-400', iconColor: '#ef4444' },
];

export default function NuevaTareaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Captura idTareaPadre si viene por URL
  const [userId, setUserId] = useState<number | null>(null);

  const { tareas, crearTarea } = useTareas(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  const [descripcion, setDescripcion] = useState('');
  const [idTipo, setIdTipo] = useState<number | null>(null);
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>('Media');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [idTareaPadre, setIdTareaPadre] = useState<number | null>(params.idTareaPadre ? Number(params.idTareaPadre) : null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  useEffect(() => {
    if (userId) {
        cargarTipos().then(() => {
            if (tipos.length > 0 && !idTipo) setIdTipo(tipos[0].id);
        });
    }
  }, [userId]);

  const handleGuardar = async () => {
    if (!descripcion.trim()) return alert('La descripción es obligatoria');
    setGuardando(true);
    
    // Tu hook guarda la fecha y hora juntas en un string
    const fechaFinal = (fecha || hora) ? `${fecha} ${hora}`.trim() : null;
    
    await crearTarea(descripcion, prioridad, idTipo, fechaFinal, idTareaPadre);
    setGuardando(false);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Nueva tarea</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Organiza tu próximo paso</Text>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Descripción</Text>
        <TextInput
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white"
          placeholder="Ej. Revisar bibliografía"
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tipo</Text>
        {tipos.length === 0 && <Text className="text-xs text-slate-500">No hay tipos. Créalos en Configuración.</Text>}
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

      <View className="flex-row justify-between gap-x-4 mb-2">
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Fecha (DD/MM/AAAA)</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center">
            <TextInput className="text-slate-900 dark:text-white text-base w-full" value={fecha} onChangeText={setFecha} placeholder="04/10/2026" />
            <Feather name="calendar" size={16} color="#94a3b8" className="absolute right-4" />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Hora (Opcional)</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center">
            <TextInput className="text-slate-900 dark:text-white text-base w-full" value={hora} onChangeText={setHora} placeholder="17:00" />
            <Feather name="clock" size={16} color="#94a3b8" className="absolute right-4" />
          </View>
        </View>
      </View>
      <Text className="text-xs text-slate-400 mb-6 ml-1">Sin hora, se usa la predeterminada de configuración.</Text>

      <View className="mb-8 mt-4">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tarea principal (Opcional)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity 
              onPress={() => setIdTareaPadre(null)}
              className={`px-4 py-3 rounded-xl border ${!idTareaPadre ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/40' : 'bg-white border-slate-200 dark:bg-slate-800'}`}
          >
              <Text className={`text-sm font-medium ${!idTareaPadre ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>Ninguna</Text>
          </TouchableOpacity>
          {tareas.filter(t => !t.completado && t.id !== idTareaPadre).map(t => (
            <TouchableOpacity 
              key={t.id} onPress={() => setIdTareaPadre(t.id)}
              className={`px-4 py-3 rounded-xl border ${idTareaPadre === t.id ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/40' : 'bg-white border-slate-200 dark:bg-slate-800'}`}
            >
              <Text className={`text-sm font-medium ${idTareaPadre === t.id ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>{t.descripcion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleGuardar} disabled={guardando}
        className={`py-4 rounded-xl items-center flex-row justify-center mb-12 shadow-sm ${guardando ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
      >
        {guardando ? <ActivityIndicator color="white" /> : (
          <><Feather name="check" size={18} color="white" /><Text className="text-white font-bold text-base ml-2">Guardar tarea</Text></>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}