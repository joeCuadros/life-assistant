import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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

export default function CrearActividadScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  
  const { crearHorario } = useHorario(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  // Estados del formulario
  const [actividad, setActividad] = useState(''); 
  const [idTipo, setIdTipo] = useState<number | null>(null);
  const [dia, setDia] = useState<any>('lunes');
  
  // Separamos Hora y Minuto para Inicio
  const [inicioH, setInicioH] = useState('15');
  const [inicioM, setInicioM] = useState('00');
  
  // Separamos Hora y Minuto para Fin
  const [finH, setFinH] = useState('16');
  const [finM, setFinM] = useState('30');
  
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { 
      if (id) { setUserId(Number(id)); }
    });
  }, []);

  useEffect(() => {
    if (userId) {
      cargarTipos().then(() => {
        if (tipos.length > 0 && !idTipo) setIdTipo(tipos[0].id);
      });
    }
  }, [userId]);

  const handleCrear = async () => {
    if (!idTipo) return Alert.alert('Error', 'Debes seleccionar o crear un Tipo primero');
    
    // Validamos rangos de hora (0-23) y minutos (0-59)
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

    // Formateamos a HH:MM para guardar en SQLite
    const horaInicioFinal = `${hInicio.toString().padStart(2, '0')}:${mInicio.toString().padStart(2, '0')}`;
    const horaFinFinal = `${hFin.toString().padStart(2, '0')}:${mFin.toString().padStart(2, '0')}`;

    setGuardando(true);
    await crearHorario(idTipo, dia, horaInicioFinal, horaFinFinal);
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
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Nueva actividad</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Añadir al horario semanal</Text>
        </View>
      </View>

      <Text className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-5">
        Organiza una actividad que se repite cada semana.
      </Text>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Actividad</Text>
        <TextInput
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white"
          placeholder="Ej. Grupo de estudio"
          placeholderTextColor="#94a3b8"
          value={actividad}
          onChangeText={setActividad}
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tipo</Text>
        {tipos.length === 0 ? (
          <Text className="text-slate-500 ml-1">Crea un tipo primero en Configuración.</Text>
        ) : (
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
        )}
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
              placeholder="09"
              placeholderTextColor="#cbd5e1"
            />
            <Text className="text-slate-900 dark:text-white text-lg font-bold pb-1">:</Text>
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={inicioM} 
              onChangeText={(t) => setInicioM(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#cbd5e1"
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
              placeholder="11"
              placeholderTextColor="#cbd5e1"
            />
            <Text className="text-slate-900 dark:text-white text-lg font-bold pb-1">:</Text>
            <TextInput 
              className="text-slate-900 dark:text-white text-lg font-bold text-center w-12" 
              value={finM} 
              onChangeText={(t) => setFinM(t.replace(/[^0-9]/g, ''))} 
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#cbd5e1"
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
        onPress={handleCrear} disabled={guardando}
        className={`py-4 rounded-xl items-center flex-row justify-center mb-12 shadow-sm ${guardando ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
      >
        {guardando ? <ActivityIndicator color="white" /> : (
          <><Feather name="check" size={18} color="white" /><Text className="text-white font-bold text-base ml-2">Guardar actividad</Text></>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}