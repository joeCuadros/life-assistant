import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { db } from '../db/database';
import { Usuario } from '../types/database';

export function useUsuario() {
  const [cargando, setCargando] = useState(false);

  const login = async (correo: string, contrasena: string) => {
    setCargando(true);
    try {
      const user = await db.getFirstAsync<Usuario>(
        'SELECT * FROM Usuario WHERE correo = ? AND contrasena = ?',
        [correo, contrasena]
      );
      if (user) {
        await AsyncStorage.setItem('userId', user.id.toString());
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const crearUsuario = async (nombre: string, correo: string, contrasena: string) => {
    setCargando(true);
    try {
      const result = await db.runAsync(
        'INSERT INTO Usuario (nombre, correo, contrasena) VALUES (?, ?, ?)',
        [nombre, correo, contrasena]
      );
      const newUser = { id: result.lastInsertRowId, nombre, correo, contrasena };
      await AsyncStorage.setItem('userId', newUser.id.toString());
      return newUser;
    } catch (error) {
      console.error('Error creando usuario:', error);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userId');
  };

  return { cargando, login, crearUsuario, logout };
}