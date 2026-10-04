# Life Assistant

Aplicacion movil desarrollada con React Native y Expo Router para la gestion personal de tiempo, horarios y tareas con soporte para subtareas jerarquicas[cite: 3, 4, 5].

---

## Caracteristicas Principales

- **Gestion de Tareas:**
  - Creacion, edicion y eliminacion de tareas con niveles de prioridad (Baja, Media, Alta, Urgente)[cite: 3, 4, 5].
  - Clasificacion obligatoria por categorias y tipos con etiquetas visuales[cite: 3, 4].
  - Creacion de subtareas vinculadas a una tarea principal desde las tarjetas o pantalla de detalle[cite: 4, 5].
  - Formato estandarizado de fecha (AAAA-MM-DD) y hora de finalizacion mediante inputs numericos segmentados.
- **Planificacion y Horarios:**
  - Deteccion de actividades en curso y bloques de Hora libre en la pantalla principal.
  - Registro semanal de actividades por dia y franja horaria[cite: 3].
- **Almacenamiento Local:**
  - Persistencia de datos local sin conexion mediante SQLite (expo-sqlite)[cite: 3].
  - Integridad referencial con borrado en cascada para subtareas y relaciones[cite: 3].
- **Interfaz:**
  - Estilizado con NativeWind y Tailwind CSS con soporte para modo oscuro[cite: 4, 5].

---

## Tecnologias Utilizadas

- React Native y Expo
- Expo Router
- SQLite (expo-sqlite)[cite: 3]
- Tailwind CSS y NativeWind
- Feather Icons (@expo/vector-icons)[cite: 4, 5]
- AsyncStorage (@react-native-async-storage/async-storage)[cite: 4, 5]

---

## Estructura del Proyecto

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── configuracion.tsx
│   │   ├── horario.tsx
│   │   ├── inicio.tsx
│   │   └── tareas.tsx
│   ├── crear-actividad.tsx
│   ├── crear-tipo.tsx
│   ├── editar-actividad.tsx
│   ├── editar-tarea.tsx
│   ├── editar-tipo.tsx
│   ├── gestionar-tipos.tsx
│   ├── index.tsx
│   ├── nueva-tarea.tsx
│   ├── registro.tsx
│   └── _layout.tsx
├── components/
│   └── TareaItem.tsx
├── constants/
│   └── iconos.ts
├── db/
│   └── database.ts
├── hooks/
│   ├── useConfiguracion.ts
│   ├── useHorario.ts
│   ├── useTareas.ts
│   ├── useTipo.ts
│   └── useUsuario.ts
└── types/
    └── database.ts

```

---

## Instalacion y Ejecucion

1. Clonar el repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd life-assistant

```


2. Instalar dependencias:
```bash
npm install

```


3. Iniciar el entorno de desarrollo:
```bash
npx expo start

```



---

## Compilacion Local del APK (Android)

1. Generar el directorio nativo:
```bash
npx expo prebuild --platform android

```


2. Configurar variables temporales en la terminal actual:
* En CMD:
```cmd
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

```


* En PowerShell:
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

```




3. Compilar el archivo APK:
```bash
cd android
.\gradlew assembleDebug

```


4. Ubicacion del archivo generado:
```text
app-debug.apk

```
