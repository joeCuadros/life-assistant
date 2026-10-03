import { useCallback, useState } from 'react';
import { db } from '../db/database';
import { Horario } from '../types/database';

export function useHorario(idUsuario: number | null) {
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const cargarHorarios = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const result = await db.getAllAsync<Horario>(
        'SELECT * FROM Horario WHERE idUsuario = ?',
        [idUsuario]
      );
      setHorarios(result);
    } catch (error) {
      console.error('Error cargando horarios:', error);
    }
  }, [idUsuario]);

  const crearHorario = async (idTipo: number, dia: string, hora_inicio: string, hora_fin: string) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        'INSERT INTO Horario (idTipo, dia, hora_inicio, hora_fin, idUsuario) VALUES (?, ?, ?, ?, ?)',
        [idTipo, dia, hora_inicio, hora_fin, idUsuario]
      );
      await cargarHorarios();
    } catch (error) {
      console.error('Error creando horario:', error);
    }
  };

  const actualizarHorario = async (id: number, idTipo: number, dia: string, hora_inicio: string, hora_fin: string) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        'UPDATE Horario SET idTipo = ?, dia = ?, hora_inicio = ?, hora_fin = ? WHERE id = ? AND idUsuario = ?',
        [idTipo, dia, hora_inicio, hora_fin, id, idUsuario]
      );
      await cargarHorarios();
    } catch (error) {
      console.error('Error actualizando horario:', error);
    }
  };

  const eliminarHorario = async (id: number) => {
    if (!idUsuario) return;
    try {
      await db.runAsync('DELETE FROM Horario WHERE id = ? AND idUsuario = ?', [id, idUsuario]);
      await cargarHorarios();
    } catch (error) {
      console.error('Error eliminando horario:', error);
    }
  };

  return { horarios, cargarHorarios, crearHorario, actualizarHorario, eliminarHorario };
}