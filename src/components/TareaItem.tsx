import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function TareaItem({ tarea, nombrePadre, nombreTipo, onToggle, onDelete }: any) {
  const router = useRouter();
  const isUrgente = tarea.prioridad === 'Urgente';
  const isAlta = tarea.prioridad === 'Alta';
  const isMedia = tarea.prioridad === 'Media';

  return (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl mb-3 border border-slate-100 dark:border-slate-700/50 shadow-sm">
      <View className="flex-row items-start justify-between">
        <TouchableOpacity className="flex-row flex-1" onPress={() => onToggle(tarea.id, tarea.completado)}>
          <Feather 
            name={tarea.completado ? "check-square" : "square"} 
            size={22} 
            color={tarea.completado ? '#10b981' : '#cbd5e1'} 
            className="mt-1" 
          />
          <View className="ml-3 flex-1">
            <Text className={`text-base font-bold mb-1 ${tarea.completado ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
              {tarea.descripcion}
            </Text>
            
            {nombrePadre && (
              <View className="flex-row items-center mb-2 mt-1">
                <Feather name="corner-down-right" size={14} color="#94a3b8" />
                <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1"> {nombrePadre}</Text>
              </View>
            )}
            
            <View className="flex-row items-center mt-2 flex-wrap gap-2">
              {nombreTipo && (
                <View className="flex-row items-center px-2 py-1 rounded-lg border bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                  <Feather name="tag" size={12} color="#4f46e5" />
                  <Text className="text-[11px] font-bold ml-1 text-indigo-500">{nombreTipo}</Text>
                </View>
              )}
              <View className={`flex-row items-center px-2 py-1 rounded-lg border 
                ${isUrgente ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                  isAlta ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                  isMedia ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 
                  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <Feather name={isUrgente ? "alert-circle" : "flag"} size={12} color={isUrgente ? '#ef4444' : isAlta ? '#f97316' : isMedia ? '#3b82f6' : '#64748b'} />
                <Text className={`text-[11px] font-bold ml-1 
                  ${isUrgente ? 'text-red-500' : isAlta ? 'text-orange-500' : isMedia ? 'text-blue-500' : 'text-slate-500'}`}>
                  {tarea.prioridad}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
        <View className="flex-row items-center gap-4">
          <Text className="text-xs text-slate-400 dark:text-slate-500">{tarea.fecha || 'Sin fecha'}</Text>
          <Text className={`text-xs font-bold ${tarea.completado ? 'text-emerald-500' : 'text-slate-400'}`}>
            {tarea.completado ? 'Completada' : 'Pendiente'}
          </Text>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Se envía el idTareaPadre como String para evitar fallos */}
          <TouchableOpacity onPress={() => router.push({ pathname: '/nueva-tarea', params: { idTareaPadre: String(tarea.id) } })}>
            <Feather name="plus-circle" size={20} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/editar-tarea', params: { id: String(tarea.id), descripcion: tarea.descripcion, prioridad: tarea.prioridad, idTipo: tarea.idTipo, fecha: tarea.fecha } })}>
            <Feather name="edit-2" size={18} color="#94a3b8" />
          </TouchableOpacity>
          {onDelete && (
             <TouchableOpacity onPress={onDelete}>
               <Feather name="trash-2" size={18} color="#ef4444" />
             </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}