import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function TareaItem({ tarea, nombrePadre, onToggle }: any) {
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
            
            {/* Si es una subtarea, muestra a quién pertenece */}
            {nombrePadre && (
              <View className="flex-row items-center mb-2 mt-1">
                <Feather name="corner-down-right" size={14} color="#94a3b8" />
                <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1">Subtarea de: {nombrePadre}</Text>
              </View>
            )}
            
            <View className="flex-row items-center mt-2 flex-wrap gap-2">
              <View className={`flex-row items-center px-2 py-1 rounded-lg border 
                ${isUrgente ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                  isAlta ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                  isMedia ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 
                  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <Feather name="flag" size={12} color={isUrgente ? '#ef4444' : isAlta ? '#f97316' : isMedia ? '#3b82f6' : '#64748b'} />
                <Text className={`text-[11px] font-bold ml-1 
                  ${isUrgente ? 'text-red-500' : isAlta ? 'text-orange-500' : isMedia ? 'text-blue-500' : 'text-slate-500'}`}>
                  {tarea.prioridad}
                </Text>
              </View>
            </View>

          </View>
        </TouchableOpacity>
        <Feather name="chevron-right" size={20} color="#cbd5e1" />
      </View>
      
      <View className="flex-row justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
        <Text className="text-xs text-slate-400 dark:text-slate-500">{tarea.fecha || 'Sin fecha'}</Text>
        <Text className={`text-xs font-bold ${tarea.completado ? 'text-emerald-500' : 'text-slate-400'}`}>
          {tarea.completado ? 'Completada' : 'Pendiente'}
        </Text>
      </View>
    </View>
  );
}