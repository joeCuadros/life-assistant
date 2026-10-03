import { useCallback, useState } from 'react';
import { db } from '../db/database';
import { Configuracion } from '../types/database';

export function useConfiguracion(idUsuario: number | null) {
  const [config, setConfig] = useState<Configuracion | null>(null);

  const cargarConfiguracion = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const result = await db.getFirstAsync<Configuracion>(
        'SELECT * FROM Configuracion WHERE idUsuario = ?',
        [idUsuario]
      );
      setConfig(result || null);
    } catch (error) {
      console.error('Error cargando configuracion:', error);
    }
  }, [idUsuario]);

  const guardarConfiguracion = async (
    tema: 'claro' | 'oscuro',
    hora_predeterminado: string,
    bloque_minutos: number,
    descanso_minutos: number,
    maximo_minutos: number
  ) => {
    if (!idUsuario) return;
    try {
      // Intentamos actualizar primero
      const updateResult = await db.runAsync(
        `UPDATE Configuracion 
         SET tema = ?, hora_predeterminado = ?, bloque_minutos = ?, descanso_minutos = ?, maximo_minutos = ? 
         WHERE idUsuario = ?`,
        [tema, hora_predeterminado, bloque_minutos, descanso_minutos, maximo_minutos, idUsuario]
      );

      // Si no actualizó ninguna fila, significa que el usuario no tiene config, la creamos
      if (updateResult.changes === 0) {
        await db.runAsync(
          `INSERT INTO Configuracion (idUsuario, tema, hora_predeterminado, bloque_minutos, descanso_minutos, maximo_minutos) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [idUsuario, tema, hora_predeterminado, bloque_minutos, descanso_minutos, maximo_minutos]
        );
      }
      
      await cargarConfiguracion();
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  return { config, cargarConfiguracion, guardarConfiguracion };
}