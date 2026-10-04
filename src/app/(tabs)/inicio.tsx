import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import TareaItem from '../../components/TareaItem';
import { useHorario } from '../../hooks/useHorario';
import { useTareas } from '../../hooks/useTareas';
import { useTipo } from '../../hooks/useTipo';

export default function InicioScreen() {
    const router = useRouter();
    const { nombre } = useGlobalSearchParams();
    const [userId, setUserId] = useState<number | null>(null);

    const { tareas, cargarTareas, marcarCompletada } = useTareas(userId);
    const { horarios, cargarHorarios } = useHorario(userId);
    const { tipos, cargarTipos } = useTipo(userId);
    const [refrescando, setRefrescando] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('userId').then(id => { if (id) setUserId(Number(id)); });
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                cargarTareas();
                cargarHorarios();
                cargarTipos();
            }
        }, [userId, cargarTareas, cargarHorarios, cargarTipos])
    );

    const onRefresh = async () => {
        setRefrescando(true);
        if (userId) {
            await cargarTareas();
            await cargarHorarios();
        }
        setRefrescando(false);
    };

    const now = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaActual = diasSemana[now.getDay()];
    const horaActualStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const horarioActual = horarios.find(h => h.dia === diaActual && horaActualStr >= h.hora_inicio && horaActualStr <= h.hora_fin);
    const tipoActividadActual = horarioActual ? tipos.find(t => t.id === horarioActual.idTipo) : null;

    const pendientes = tareas.filter(t => !t.completado);
    const completadas = tareas.filter(t => t.completado);
    const total = tareas.length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);

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

    const fechaFormat = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);

    return (
        <ScrollView
            className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        >
            <View className="mb-6">
                <Text className="text-3xl font-bold text-slate-900 dark:text-white">Hola, {nombre}</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400 capitalize">{fechaFormat}</Text>
            </View>

            <View className={`rounded-[24px] p-6 mb-6 border ${horarioActual ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
                <Text className={`text-xs font-bold tracking-widest mb-1 ${horarioActual ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    AHORA MISMO
                </Text>
                {horarioActual ? (
                    <>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {tipoActividadActual?.nombre || 'Actividad programada'}
                        </Text>
                        <Text className="text-sm text-slate-600 dark:text-slate-400">
                            Termina a las {horarioActual.hora_fin}
                        </Text>
                    </>
                ) : (
                    <>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hora libre</Text>
                        <Text className="text-sm text-slate-600 dark:text-slate-400">
                            Aprovecha para descansar o avanzar tareas.
                        </Text>
                    </>
                )}
            </View>

            <View className="bg-white dark:bg-slate-800 rounded-[24px] p-6 mb-8 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tu progreso hoy</Text>
                <View className="flex-row mb-6">
                    <View className="flex-1">
                        <Text className="text-4xl font-extrabold text-slate-900 dark:text-white">{pendientes.length}</Text>
                        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Pendientes</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{completadas.length}</Text>
                        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Completadas</Text>
                    </View>
                </View>

                <View>
                    <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        {completadas.length} de {total} completadas · {porcentaje} %
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
                <Text className="text-center text-slate-500 my-4">Todo al día. ¡Buen trabajo!</Text>
            ) : (
                pendientes.slice(0, 3).map(tarea => (
                    <TareaItem key={tarea.id} tarea={tarea} nombrePadre={getNombrePadre(tarea.idTareaPadre as number)} nombreTipo={getNombreTipo(tarea.idTipo as number)} onToggle={marcarCompletada} />
                ))
            )}
            <View className="h-20" />
        </ScrollView>
    );
}