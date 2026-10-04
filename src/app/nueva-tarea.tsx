import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTareas } from '../hooks/useTareas';
import { useTipo } from '../hooks/useTipo';

const SelectInput = ({ label, value, opciones, onSelect, placeholder }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const textToShow = value ? opciones.find((o: any) => o.id === value)?.nombre : placeholder;

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center shadow-sm">
                <Text className={`text-base ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{textToShow}</Text>
                <Feather name="chevron-down" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-12 max-h-[50%]">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Seleccionar {label}</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {opciones.map((opc: any) => (
                                    <TouchableOpacity 
                                        key={opc.id} 
                                        onPress={() => { onSelect(opc.id); setModalVisible(false); }} 
                                        className="py-4 border-b border-slate-100 dark:border-slate-800 flex-row justify-between items-center"
                                    >
                                        <Text className={`text-base ${value === opc.id ? 'font-bold text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>{opc.nombre}</Text>
                                        {value === opc.id && <Feather name="check" size={18} color="#4f46e5" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const PRIORIDADES_UI = [
  { id: 'Baja', icon: 'flag' },
  { id: 'Media', icon: 'flag' },
  { id: 'Alta', icon: 'flag' },
  { id: 'Urgente', icon: 'alert-circle' },
];

export default function NuevaTareaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const [userId, setUserId] = useState<number | null>(null);

  // AÑADIDO: cargarTareas para que la lista no esté vacía
  const { tareas, crearTarea, cargarTareas } = useTareas(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  const [descripcion, setDescripcion] = useState('');
  const [idTipo, setIdTipo] = useState<number | null>(null);
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>('Alta');
  
  const hoy = new Date();
  const [dia, setDia] = useState(String(hoy.getDate()).padStart(2, '0'));
  const [mes, setMes] = useState(String(hoy.getMonth() + 1).padStart(2, '0'));
  const [anio, setAnio] = useState(String(hoy.getFullYear()));

  const [finH, setFinH] = useState('');
  const [finM, setFinM] = useState('');

  const idTareaPadre = params.idTareaPadre ? Number(params.idTareaPadre) : null;
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  useEffect(() => {
    if (userId) {
        cargarTareas(); // AÑADIDO: Para que encuentre a la tarea padre
        cargarTipos().then(() => {
            if (tipos.length > 0 && !idTipo) setIdTipo(tipos[0].id);
        });
    }
  }, [userId]);

  const handleGuardar = async () => {
    if (!descripcion.trim()) return alert('La descripción es obligatoria');
    if (!idTipo) return alert('El tipo es obligatorio');

    setGuardando(true);

    const fechaArmada = (anio && mes && dia) ? `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}` : '';
    const horaFinal = (finH || finM) ? `${(finH || '00').padStart(2, '0')}:${(finM || '00').padStart(2, '0')}` : '';
    const fechaFinal = (fechaArmada || horaFinal) ? `${fechaArmada} ${horaFinal}`.trim() : null;
    
    await crearTarea(descripcion, prioridad, idTipo, fechaFinal, idTareaPadre);
    setGuardando(false);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center mb-8">
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
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white h-24"
          placeholder="Ej. Revisar bibliografía"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline={true}
          textAlignVertical="top"
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tipo</Text>
        {tipos.length === 0 ? (
            <Text className="text-xs text-slate-500">No hay tipos. Créalos en Configuración.</Text>
        ) : (
            <SelectInput 
                label="Tipo" 
                value={idTipo} 
                opciones={tipos.map(t => ({ id: t.id, nombre: t.nombre }))} 
                onSelect={setIdTipo} 
                placeholder="Seleccionar tipo..." 
            />
        )}
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Prioridad</Text>
        <View className="flex-row justify-between">
          {PRIORIDADES_UI.map(p => {
            const isSelected = prioridad === p.id;
            return (
              <TouchableOpacity 
                key={p.id} onPress={() => setPrioridad(p.id as any)}
                className={`flex-1 py-3 items-center rounded-xl mx-1 border ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200'}`}
              >
                <Feather name={p.icon as any} size={16} color={isSelected ? '#4f46e5' : '#94a3b8'} />
                <Text className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>{p.id}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View className="flex-row justify-between gap-x-4 mb-2">
        <View className="flex-[1.5]">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Fecha (DD/MM/AAAA)</Text>
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex-row justify-center items-center">
            <TextInput className="text-slate-900 dark:text-white text-base text-center" value={dia} onChangeText={setDia} placeholder="DD" keyboardType="numeric" maxLength={2} style={{ width: 30 }} />
            <Text className="text-slate-400 mx-1">/</Text>
            <TextInput className="text-slate-900 dark:text-white text-base text-center" value={mes} onChangeText={setMes} placeholder="MM" keyboardType="numeric" maxLength={2} style={{ width: 32 }} />
            <Text className="text-slate-400 mx-1">/</Text>
            <TextInput className="text-slate-900 dark:text-white text-base text-center" value={anio} onChangeText={setAnio} placeholder="AAAA" keyboardType="numeric" maxLength={4} style={{ width: 45 }} />
          </View>
        </View>
        
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
      <Text className="text-[11px] text-slate-400 mb-6 ml-1">Sin hora, se planifica a las 09:00 según tu configuración.</Text>

      {/* INPUT BLOQUEADO SOLO LECTURA */}
      {idTareaPadre && (
        <View className="mb-8">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tarea principal</Text>
          <View className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center opacity-70">
              <Text className="text-slate-600 dark:text-slate-400 text-base">
                  {/* SE CORRIGIÓ EL MENSAJE POR DEFECTO PARA QUE DIGA 'Cargando...' MIENTRAS CARGA LA BD */}
                  {tareas.find(t => Number(t.id) === idTareaPadre)?.descripcion || 'Cargando tarea...'}
              </Text>
              <Feather name="lock" size={16} color="#94a3b8" />
          </View>
          <Text className="text-[11px] text-slate-400 mt-2 ml-1">Se guardará como subtarea de esta.</Text>
        </View>
      )}

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