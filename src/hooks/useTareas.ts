import { useCallback, useState } from 'react';
import { db } from '../db/database';
import { Tarea } from '../types/database';

export function useTareas(idUsuario: number | null) {
  const [tareas, setTareas] = useState<Tarea[]>([]);

  const cargarTareas = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM Tareas WHERE idUsuario = ? ORDER BY id DESC',
        [idUsuario]
      );
      setTareas(result.map(row => ({ ...row, completado: row.completado === 1 })));
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  }, [idUsuario]);

  const crearTarea = async (
    descripcion: string,
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente' = 'Media',
    idTipo: number | null = null,
    fecha: string | null = null,
    idTareaPadre: number | null = null
  ) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        `INSERT INTO Tareas (idTareaPadre, descripcion, prioridad, idTipo, fecha, completado, idUsuario) 
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [idTareaPadre, descripcion, prioridad, idTipo, fecha, idUsuario]
      );
      await cargarTareas();
    } catch (error) {
      console.error('Error creando tarea:', error);
    }
  };

  const actualizarTarea = async (
    id: number,
    descripcion: string,
    prioridad: string,
    idTipo: number | null,
    fecha: string | null
  ) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        `UPDATE Tareas SET descripcion = ?, prioridad = ?, idTipo = ?, fecha = ? 
         WHERE id = ? AND idUsuario = ?`,
        [descripcion, prioridad, idTipo, fecha, id, idUsuario]
      );
      await cargarTareas();
    } catch (error) {
      console.error('Error actualizando tarea:', error);
    }
  };

  const marcarCompletada = async (id: number, estadoActual: boolean) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        'UPDATE Tareas SET completado = ? WHERE id = ? AND idUsuario = ?',
        [estadoActual ? 0 : 1, id, idUsuario]
      );
      await cargarTareas();
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
    }
  };

  const eliminarTarea = async (id: number) => {
    if (!idUsuario) return;
    try {
      await db.runAsync('DELETE FROM Tareas WHERE id = ? AND idUsuario = ?', [id, idUsuario]);
      await cargarTareas();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  return { tareas, cargarTareas, crearTarea, actualizarTarea, marcarCompletada, eliminarTarea };
}