import { useCallback, useState } from 'react';
import { db } from '../db/database';
import { Tipo } from '../types/database';

export function useTipo(idUsuario: number | null) {
  const [tipos, setTipos] = useState<Tipo[]>([]);

  const cargarTipos = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const result = await db.getAllAsync<Tipo>(
        'SELECT * FROM Tipo WHERE idUsuario = ? ORDER BY nombre ASC',
        [idUsuario]
      );
      setTipos(result);
    } catch (error) {
      console.error('Error cargando tipos:', error);
    }
  }, [idUsuario]);

  const crearTipo = async (nombre: string, icono: string | null = null) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        'INSERT INTO Tipo (nombre, icono, idUsuario) VALUES (?, ?, ?)',
        [nombre, icono, idUsuario]
      );
      await cargarTipos();
    } catch (error) {
      console.error('Error creando tipo (¿nombre duplicado?):', error);
    }
  };

  const actualizarTipo = async (id: number, nombre: string, icono: string | null) => {
    if (!idUsuario) return;
    try {
      await db.runAsync(
        'UPDATE Tipo SET nombre = ?, icono = ? WHERE id = ? AND idUsuario = ?',
        [nombre, icono, id, idUsuario]
      );
      await cargarTipos();
    } catch (error) {
      console.error('Error actualizando tipo:', error);
    }
  };

  const eliminarTipo = async (id: number) => {
    if (!idUsuario) return;
    try {
      await db.runAsync('DELETE FROM Tipo WHERE id = ? AND idUsuario = ?', [id, idUsuario]);
      await cargarTipos();
    } catch (error) {
      console.error('Error eliminando tipo:', error);
    }
  };

  return { tipos, cargarTipos, crearTipo, actualizarTipo, eliminarTipo };
}