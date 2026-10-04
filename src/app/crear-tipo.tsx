import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ICONOS_DISPONIBLES } from '../constants/iconos';
import { useTipo } from '../hooks/useTipo';

export default function CrearTipoScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  
  const { crearTipo } = useTipo(userId);

  const [nombre, setNombre] = useState('');
  const [iconoSeleccionado, setIconoSeleccionado] = useState(ICONOS_DISPONIBLES[0]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  const handleCrear = async () => {
    if (!nombre.trim()) return alert('El nombre no puede estar vacío');
    setGuardando(true);
    await crearTipo(nombre, iconoSeleccionado);
    setGuardando(false);
    router.back(); // Regresar tras guardar
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12">
      
      {/* Cabecera[cite: 4] */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo tipo</Text>
      </View>

      <Text className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-5">
        Agrupa tus tareas y actividades para encontrarlas fácilmente.
      </Text>

      {/* Input Nombre[cite: 4] */}
      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Nombre del tipo</Text>
        <TextInput
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white text-base"
          placeholder="Ej. Salud"
          placeholderTextColor="#94a3b8"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      {/* Selector de Iconos */}
      <View className="mb-8">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-3 ml-1">Icono</Text>
        <View className="flex-row flex-wrap justify-start">
          {ICONOS_DISPONIBLES.map((ico) => {
            const isSelected = iconoSeleccionado === ico;
            return (
              <TouchableOpacity 
                key={ico}
                onPress={() => setIconoSeleccionado(ico)}
                // Agregamos mr-3 y mb-3 aquí para separar los iconos en la cuadrícula
                className={`w-14 h-14 rounded-2xl items-center justify-center border mr-3 mb-3 ${
                  isSelected 
                    ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-500' 
                    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <Feather name={ico as any} size={22} color={isSelected ? '#4f46e5' : '#94a3b8'} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Vista Previa[cite: 4] */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-8">
        <Text className="text-[10px] font-bold text-slate-400 tracking-wider mb-3 uppercase">Vista Previa</Text>
        <View className="flex-row items-center">
          <Feather name={(iconoSeleccionado as any) || 'box'} size={20} color="#4f46e5" />
          <Text className="text-base font-bold text-slate-900 dark:text-white ml-3">
            {nombre || 'Nombre del tipo'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleCrear}
        disabled={guardando}
        className={`py-4 rounded-xl items-center flex-row justify-center active:bg-indigo-700 ${guardando ? 'bg-indigo-400' : 'bg-indigo-600'}`}
      >
        {guardando ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Feather name="check" size={18} color="white" />
            <Text className="text-white font-bold text-base ml-2">Crear tipo</Text>
          </>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}