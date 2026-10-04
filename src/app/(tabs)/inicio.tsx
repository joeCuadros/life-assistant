import { Feather } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import TareaItem from '../../components/TareaItem'; // Importación limpia
import { useTareas } from '../../hooks/useTareas';

export default function InicioScreen() {
    const router = useRouter();
    const { idUsuario, nombre } = useGlobalSearchParams();
    const userId = Number(idUsuario);

    // Usamos estrictamente tu hook sin inventar propiedades
    const { tareas, cargarTareas, marcarCompletada } = useTareas(userId);
    const [refrescando, setRefrescando] = useState(false);

    useEffect(() => {
        cargarTareas();
    }, [cargarTareas]);

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarTareas();
        setRefrescando(false);
    };

    const pendientes = tareas.filter(t => !t.completado);
    const completadas = tareas.filter(t => t.completado);
    const total = tareas.length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);

    const fechaActual = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());

    return (
        <ScrollView
            className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        >
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-3xl font-bold text-slate-900 dark:text-white">Hola, {nombre}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 capitalize">{fechaActual}</Text>
                </View>
                <TouchableOpacity className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
                    <Feather name="bell" size={22} color="#4f46e5" />
                </TouchableOpacity>
            </View>

            <View className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-[32px] p-7 mb-8 border border-indigo-100 dark:border-indigo-800/30">
                <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest mb-2">TU SEMANA, EN ORDEN</Text>
                <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Un paso a la vez.</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-5 pr-4">
                    Tienes {pendientes.length} tareas pendientes.
                </Text>

                <View className="flex-row mb-8">
                    <View className="flex-1">
                        <Text className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">{pendientes.length}</Text>
                        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Pendientes</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-5xl font-extrabold text-slate-900 dark:text-white">{completadas.length}</Text>
                        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Completadas</Text>
                    </View>
                </View>

                <View className="mb-2">
                    <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                        {completadas.length} de {total} completadas - {porcentaje} %
                    </Text>
                    <View className="h-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                        <View className="h-full bg-indigo-600 rounded-full" style={{ width: `${porcentaje}%` }} />
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Lo próximo</Text>
                <TouchableOpacity onPress={() => router.push('/tareas')}>
                    <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Ver todas</Text>
                </TouchableOpacity>
            </View>

            {pendientes.length === 0 ? (
                <Text className="text-center text-slate-500 my-4">No tienes tareas pendientes.</Text>
            ) : (
                pendientes.slice(0, 3).map(tarea => (
                    <TareaItem key={tarea.id} tarea={tarea} onToggle={marcarCompletada} />
                ))
            )}
            <View className="h-20" />
        </ScrollView>
    );
}