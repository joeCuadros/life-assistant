import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useHorario } from '../hooks/useHorario';
import { useTipo } from '../hooks/useTipo';

const DIAS = [
  { key: 'lunes', label: 'Lun' }, { key: 'martes', label: 'Mar' },
  { key: 'miercoles', label: 'Mié' }, { key: 'jueves', label: 'Jue' },
  { key: 'viernes', label: 'Vie' } , { key: 'sabado', label: 'Sab' },
  { key: 'domingo', label: 'Dom' },
];

export default function EditarActividadScreen() {
  const router = useRouter();
  const { id, idTipo: paramIdTipo, dia: paramDia, inicio: paramInicio, fin: paramFin } = useLocalSearchParams();
  const horarioId = Number(id);

  const [userId, setUserId] = useState<number | null>(null);
  const { actualizarHorario, eliminarHorario } = useHorario(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  // Extraemos HH y MM de los parámetros que vienen como "09:00"
  const [inicioParamH, inicioParamM] = ((paramInicio as string) || '09:00').split(':');
  const [finParamH, finParamM] = ((paramFin as string) || '11:00').split(':');

  const [actividad, setActividad] = useState('');
  const [idTipo, setIdTipo] = useState<number>(Number(paramIdTipo));
  const [dia, setDia] = useState<any>(paramDia || 'lunes');
  
  const [inicioH, setInicioH] = useState(inicioParamH);
  const [inicioM, setInicioM] = useState(inicioParamM);
  
  const [finH, setFinH] = useState(finParamH);
  const [finM, setFinM] = useState(finParamM);
  
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(idMemoria => { 
      if (idMemoria) setUserId(Number(idMemoria)); 
    });
  }, []);

  useEffect(() => {
    if (userId) cargarTipos();
  }, [userId]);

  const handleGuardar = async () => {
    const hInicio = parseInt(inicioH || '0');
    const mInicio = parseInt(inicioM || '0');
    const hFin = parseInt(finH || '0');
    const mFin = parseInt(finM || '0');

    if (hInicio < 0 || hInicio > 23 || mInicio < 0 || mInicio > 59) {
      return Alert.alert('Error', 'La hora de inicio es inválida.');
    }
    if (hFin < 0 || hFin > 23 || mFin < 0 || mFin > 59) {
      return Alert.alert('Error', 'La hora de finalización es inválida.');
    }

    const horaInicioFinal = `${hInicio.toString().padStart(2, '0')}:${mInicio.toString().padStart(2, '0')}`;
    const horaFinFinal = `${hFin.toString().padStart(2, '0')}:${mFin.toString().padStart(2, '0')}`;

    setGuardando(true);
    await actualizarHorario(horarioId, idTipo, dia, horaInicioFinal, horaFinFinal);
    setGuardando(false);
    router.back();
  };

  const handleEliminar = () => {
    Alert.alert("Eliminar actividad", "¿Seguro que quieres eliminar este horario?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
          await eliminarHorario(horarioId);
          router.back();
      }}
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12">
      
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Editar actividad</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Modifica tu horario semanal</Text>
        </View>
      </View>

      <Text className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-5">
        Organiza una actividad que se repite cada semana.
      </Text>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Actividad</Text>
        <TextInput
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white"
          placeholder="Modificar nombre"
          placeholderTextColor="#94a3b8"
          value={actividad}
          onChangeText={setActividad}
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
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Día de la semana</Text>
        <View className="flex-row justify-between">
          {DIAS.map(d => (
            <TouchableOpacity 
              key={d.key} onPress={() => setDia(d.key)}
              className={`flex-1 py-3 items-center rounded-xl mx-1 border ${dia === d.key ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
            >
              <Text className={`text-sm font-bold ${dia === d.key ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="flex-row justify-between gap-x-4 mb-8">
        {/* HORA DE INICIO: 2 Inputs */}
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Hora de inicio</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 flex-row justify-center items-center">
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={inicioH} 
              onChangeText={(t) => setInicioH(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2} 
            />
            <Text className="text-slate-900 dark:text-white text-lg font-bold pb-1">:</Text>
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={inicioM} 
              onChangeText={(t) => setInicioM(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2} 
            />
          </View>
        </View>

        {/* HORA DE FINALIZACIÓN: 2 Inputs */}
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Hora de finalización</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 flex-row justify-center items-center">
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={finH} 
              onChangeText={(t) => setFinH(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2} 
            />
            <Text className="text-slate-900 dark:text-white text-lg font-bold pb-1">:</Text>
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={finM} 
              onChangeText={(t) => setFinM(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2} 
            />
          </View>
        </View>
      </View>

      <View className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 flex-row items-center mb-8">
        <Feather name="check-circle" size={18} color="#4f46e5" />
        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-slate-900 dark:text-white capitalize">{dia} · Horario programado</Text>
          <Text className="text-xs text-slate-500 mt-1">Asegúrate de no solapar actividades.</Text>
        </View>
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
        <Text className="text-red-500 font-bold text-base ml-2">Eliminar actividad</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}