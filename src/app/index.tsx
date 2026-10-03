import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useConfiguracion } from '../hooks/useConfiguracion';
import { useUsuario } from '../hooks/useUsuario';

export default function HomeScreen() {
  // 1. Hooks de Base de Datos
  const { usuarioActual, cargando: cargandoUser, login, crearUsuario, logout } = useUsuario();
  const { config, cargarConfiguracion, guardarConfiguracion } = useConfiguracion(usuarioActual?.id || null);
  
  // 2. Hook de Tailwind
  const { setColorScheme } = useColorScheme();

  // 3. Estados locales para los inputs del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);

  // Cuando el usuario se loguea, cargamos su configuración
  useEffect(() => {
    if (usuarioActual) {
      cargarConfiguracion();
    }
  }, [usuarioActual, cargarConfiguracion]);

  // Sincronizar el tema de la BD con Tailwind
  useEffect(() => {
    if (config?.tema) {
      setColorScheme(config.tema === 'oscuro' ? 'dark' : 'light');
    } else {
      // Por defecto si el usuario es nuevo
      setColorScheme('light');
    }
  }, [config?.tema, setColorScheme]);

  // Manejar Login / Registro
  const handleAuth = async () => {
    if (esRegistro) {
      if (!nombre || !correo || !contrasena) return alert('Llena todos los campos');
      const exito = await crearUsuario(nombre, correo, contrasena);
      if (!exito) alert('Error al registrar (¿Correo ya existe?)');
    } else {
      if (!correo || !contrasena) return alert('Llena todos los campos');
      const exito = await login(correo, contrasena);
      if (!exito) alert('Credenciales incorrectas');
    }
  };

  // Alternar y guardar Tema
  const toggleTema = async () => {
    if (!usuarioActual) return;
    const nuevoTema = config?.tema === 'oscuro' ? 'claro' : 'oscuro';
    await guardarConfiguracion(
      nuevoTema,
      config?.hora_predeterminado || '00:00',
      config?.bloque_minutos || 30,
      config?.descanso_minutos || 5,
      config?.maximo_minutos || 120
    );
  };

  // PANTALLA DE CARGA
  if (cargandoUser) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-100 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  // PANTALLA 1: LOGIN / REGISTRO (Si no hay usuario en sesión)
  if (!usuarioActual) {
    return (
      <View className="flex-1 justify-center px-8 bg-slate-100 dark:bg-slate-900">
        <Text className="text-3xl font-bold text-slate-800 dark:text-sky-400 mb-8 text-center">
          {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </Text>

        {esRegistro && (
          <TextInput
            placeholder="Tu Nombre"
            placeholderTextColor="#94a3b8"
            value={nombre}
            onChangeText={setNombre}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg mb-4 border border-slate-200 dark:border-slate-700"
          />
        )}
        
        <TextInput
          placeholder="Correo Electrónico"
          placeholderTextColor="#94a3b8"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg mb-4 border border-slate-200 dark:border-slate-700"
        />
        
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg mb-6 border border-slate-200 dark:border-slate-700"
        />

        <TouchableOpacity 
          onPress={handleAuth}
          className="bg-sky-500 py-4 rounded-lg items-center mb-4 active:bg-sky-600"
        >
          <Text className="text-white font-bold text-lg">
            {esRegistro ? 'Registrarse' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setEsRegistro(!esRegistro)}>
          <Text className="text-slate-500 dark:text-slate-400 text-center mt-2">
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // PANTALLA 2: DASHBOARD (Usuario logueado)
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-900 px-6 transition-colors duration-300">
      <Text className="text-3xl font-bold text-slate-800 dark:text-sky-400 mb-2">
        Hola, {usuarioActual.nombre}
      </Text>
      
      <Text className="text-base text-slate-500 dark:text-slate-400 mb-8 text-center">
        Tema guardado en SQLite: 
        <Text className="font-bold text-sky-500"> {config?.tema?.toUpperCase() || 'CARGANDO...'}</Text>
      </Text>

      <TouchableOpacity 
        onPress={toggleTema}
        className="bg-slate-800 dark:bg-white px-6 py-4 rounded-xl shadow-md active:opacity-80 mb-4 w-full items-center"
      >
        <Text className="text-white dark:text-slate-900 font-semibold text-lg">
          Cambiar a modo {config?.tema === 'oscuro' ? 'Claro' : 'Oscuro'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={logout}
        className="bg-red-500 px-6 py-4 rounded-xl shadow-md active:bg-red-600 w-full items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}