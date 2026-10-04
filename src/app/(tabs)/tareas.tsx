import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import TareaItem from '../../components/TareaItem';
import { useTareas } from '../../hooks/useTareas';
import { useTipo } from '../../hooks/useTipo';

const SelectFiltro = ({ label, value, opciones, onSelect }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 mx-1 mb-2 shadow-sm">
                <Text className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</Text>
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-bold text-slate-800 dark:text-slate-200" numberOfLines={1}>{value}</Text>
                    <Feather name="chevron-down" size={16} color="#94a3b8" />
                </View>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-12 max-h-[50%]">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filtrar por {label}</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {opciones.map((opc: string, idx: number) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        onPress={() => { onSelect(opc); setModalVisible(false); }} 
                                        className="py-4 border-b border-slate-100 dark:border-slate-800 flex-row justify-between items-center"
                                    >
                                        <Text className={`text-base ${value === opc ? 'font-bold text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>{opc}</Text>
                                        {value === opc && <Feather name="check" size={18} color="#4f46e5" />}
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

export default function TareasScreen() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);

    const { tareas, cargarTareas, marcarCompletada, eliminarTarea } = useTareas(userId);
    const { tipos, cargarTipos } = useTipo(userId);
    const [refrescando, setRefrescando] = useState(false);

    const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');
    const [filtroEstado, setFiltroEstado] = useState('Todos');

    useEffect(() => {
        AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                cargarTareas();
                cargarTipos();
            }
        }, [userId, cargarTareas, cargarTipos])
    );

    const onRefresh = async () => {
        setRefrescando(true);
        if (userId) await cargarTareas();
        setRefrescando(false);
    };

    const handleEliminar = (id: number) => {
        Alert.alert("Eliminar tarea", "¿Seguro que quieres eliminar esta tarea?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => eliminarTarea(id) }
        ]);
    };

    let tareasFiltradas = tareas;
    if (filtroPrioridad !== 'Todas') tareasFiltradas = tareasFiltradas.filter(t => t.prioridad === filtroPrioridad);
    if (filtroEstado === 'Pendientes') tareasFiltradas = tareasFiltradas.filter(t => !t.completado);
    else if (filtroEstado === 'Completadas') tareasFiltradas = tareasFiltradas.filter(t => t.completado);

    const pendientes = tareasFiltradas.filter(t => !t.completado);
    const completadas = tareasFiltradas.filter(t => t.completado);

    const getNombrePadre = (idPadre: number) => {
        if (!idPadre) return null;
        const padre = tareas.find(t => t.id === idPadre);
        return padre ? padre.descripcion : null;
    };

    const getNombreTipo = (idTipo: number) => {
        if (!idTipo) return null;
        const tipo = tipos.find(t => t.id === idTipo);
        return tipo ? tipo.nombre : null;
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <ScrollView className="flex-1 px-5 pt-12" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}>
                
                <View className="mb-6">
                    <Text className="text-4xl font-bold text-slate-900 dark:text-white">Mis tareas</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {pendientes.length} pendientes · {completadas.length} completadas
                    </Text>
                </View>

                <View className="flex-row mx-[-4px] mb-8">
                    <SelectFiltro label="Prioridad" value={filtroPrioridad} opciones={['Todas', 'Baja', 'Media', 'Alta', 'Urgente']} onSelect={setFiltroPrioridad} />
                    <SelectFiltro label="Estado" value={filtroEstado} opciones={['Todos', 'Pendientes', 'Completadas']} onSelect={setFiltroEstado} />
                </View>

                <View className="flex-row justify-between items-center mb-4">
                    <View className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">{tareasFiltradas.length} tareas</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/gestionar-tipos')}>
                        <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Gestionar tipos →</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center mb-3 mt-4">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Pendientes</Text>
                    <Text className="text-xs font-bold text-indigo-500">Por fecha ↑</Text>
                </View>

                {pendientes.length === 0 && <Text className="text-slate-500 mb-6">No hay tareas con estos filtros.</Text>}

                {pendientes.map(tarea => (
                    <TareaItem key={tarea.id} tarea={tarea} nombrePadre={getNombrePadre(tarea.idTareaPadre as number)} nombreTipo={getNombreTipo(tarea.idTipo as number)} onToggle={marcarCompletada} onDelete={() => handleEliminar(tarea.id)} />
                ))}

                {completadas.length > 0 && (
                    <>
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-3 mt-8">
                            Completadas · {completadas.length}
                        </Text>
                        {completadas.map(tarea => (
                            <TareaItem key={tarea.id} tarea={tarea} nombrePadre={getNombrePadre(tarea.idTareaPadre as number)} nombreTipo={getNombreTipo(tarea.idTipo as number)} onToggle={marcarCompletada} onDelete={() => handleEliminar(tarea.id)} />
                        ))}
                    </>
                )}
                <View className="h-32" />
            </ScrollView>

            <TouchableOpacity onPress={() => router.push('/nueva-tarea')} className="absolute bottom-8 right-6 bg-indigo-600 px-5 py-4 rounded-full shadow-lg flex-row items-center active:bg-indigo-700">
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}