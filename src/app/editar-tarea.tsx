import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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

export default function EditarTareaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tareaId = Number(params.id);

  const [userId, setUserId] = useState<number | null>(null);

  const { tareas, cargarTareas, actualizarTarea, eliminarTarea } = useTareas(userId);
  const { tipos, cargarTipos } = useTipo(userId);

  const tareaActual = tareas.find(t => t.id === tareaId);
  const idTareaPadre = tareaActual?.idTareaPadre || null;

  const [descripcion, setDescripcion] = useState((params.descripcion as string) || '');
  const [idTipo, setIdTipo] = useState<number | null>(params.idTipo ? Number(params.idTipo) : null);
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>((params.prioridad as any) || 'Urgente');
  
  const [fechaStr, horaStr] = (params.fecha as string || '').split(' ');
  const [anioIni = '', mesIni = '', diaIni = ''] = fechaStr ? fechaStr.split('-') : [];
  
  const [dia, setDia] = useState(diaIni);
  const [mes, setMes] = useState(mesIni);
  const [anio, setAnio] = useState(anioIni);
  
  const [horaIni = '', minIni = ''] = horaStr ? horaStr.split(':') : [];
  const [finH, setFinH] = useState(horaIni);
  const [finM, setFinM] = useState(minIni);

  const [guardando, setGuardando] = useState(false);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        cargarTipos();
        cargarTareas();
      }
    }, [userId])
  );

  const handleGuardar = async () => {
    if (!descripcion.trim()) return alert('La descripción es obligatoria');
    if (!idTipo) return alert('El tipo es obligatorio');

    setGuardando(true);
    
    const fechaArmada = (anio && mes && dia) ? `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}` : '';
    const horaFinal = (finH || finM) ? `${(finH || '00').padStart(2, '0')}:${(finM || '00').padStart(2, '0')}` : '';
    const fechaFinal = (fechaArmada || horaFinal) ? `${fechaArmada} ${horaFinal}`.trim() : null;
    
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

  const misSubtareas = tareas.filter(t => t.idTareaPadre === tareaId);

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center mb-8">
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
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white h-24"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Entregar informe de metodología"
          multiline={true}
          textAlignVertical="top"
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tipo</Text>
        <SelectInput 
            label="Tipo" 
            value={idTipo} 
            opciones={tipos.map(t => ({ id: t.id, nombre: t.nombre }))} 
            onSelect={setIdTipo} 
            placeholder="Seleccionar tipo..." 
        />
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

      {idTareaPadre && (
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-900 dark:text-white mb-2 ml-1">Tarea principal</Text>
          <View className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 flex-row justify-between items-center opacity-70">
              <Text className="text-slate-600 dark:text-slate-400 text-base">
                  {tareas.find(t => Number(t.id) === idTareaPadre)?.descripcion || 'Cargando tarea...'}
              </Text>
              <Feather name="lock" size={16} color="#94a3b8" />
          </View>
          <Text className="text-[11px] text-slate-400 mt-2 ml-1">Esta tarea es una subtarea.</Text>
        </View>
      )}

      {!idTareaPadre && (
        <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-bold text-slate-800">Subtareas</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/nueva-tarea', params: { idTareaPadre: String(tareaId) } })}>
              <Text className="text-sm font-bold text-indigo-600">+ Crear</Text>
            </TouchableOpacity>
          </View>
          
          {misSubtareas.length === 0 ? (
            <Text className="text-sm text-slate-500">No hay subtareas vinculadas.</Text>
          ) : (
            misSubtareas.map(sub => (
              <TouchableOpacity 
                key={sub.id} 
                onPress={() => router.push({ pathname: '/editar-tarea', params: { id: String(sub.id), descripcion: sub.descripcion, prioridad: sub.prioridad, idTipo: sub.idTipo, fecha: sub.fecha } })}
                className="flex-row justify-between items-center py-2"
              >
                <View>
                  <Text className={`text-base font-bold ${sub.completado ? 'line-through text-slate-400' : 'text-slate-800'}`}>{sub.descripcion}</Text>
                  <Text className="text-xs text-slate-500 mt-1">{sub.completado ? 'Completada' : 'Pendiente'} · {sub.fecha || 'Sin fecha'}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <TouchableOpacity 
        onPress={() => setCompletado(!completado)}
        className="bg-white border border-slate-200 rounded-2xl p-5 flex-row justify-between items-center mb-8 shadow-sm"
      >
        <View className="flex-row items-center">
            <Feather name={completado ? "check-circle" : "circle"} size={22} color={completado ? "#4f46e5" : "#cbd5e1"} />
            <Text className="text-base font-medium text-slate-800 ml-3">{completado ? 'Completada' : 'Pendiente'}</Text>
        </View>
        <Text className="text-sm font-bold text-indigo-600">Marcar completada</Text>
      </TouchableOpacity>

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