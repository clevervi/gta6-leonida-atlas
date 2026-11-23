# GTA VI — Atlas y Guia Interactiva de Leonida

Mapa interactivo completo y guia del Estado de Leonida para **Grand Theft Auto VI**, listo para desplegar en **Vercel** con carga instantanea y guardado automatico del progreso en el navegador.

## Contenido Incluido

- **Mapa Completo de Leonida (Modo Noche y Modo Dia):**
  - Navegacion fluida con zoom profundo hasta nivel de calle, soporte tactil (*pinch-to-zoom* en movil/tablet), radar interactivo en esquina, cuadricula tactica (`A-1` a `M-9`) y salto rapido a los 5 condados y cayos (**Vice City**, **Port Gellhorn**, **Mount Kalaga**, **Ambrosia**, **Grassrivers** y **Leonida Keys**).
  - **110 marcadores calibrados** sobre las ubicaciones reales del mapa con rotulos de distrito, enlaces directos para compartir (`?pin=...`) y notas comunitarias.
  - **Medidor de Ruta GPS (`Tecla M`):** traza rutas multipunto con distancia real en millas y kilometros.
- **Eventos, Extranos y Locos y Actividades (`32` guias paso a paso):**
  - Historias secundarias completas: **Kirk y el Skunk Ape (*Mr. Mangrove*)**, **Bret Vogel**, **Kenton**, **Kyle**, **Yago**, **Pilot Pete**, **Randy**, **Tyrone**, **Billy**, **Andy** y **Shirley** (con aviso de misiones perdibles).
  - **Eventos Aleatorios**, **Caza Legendaria** (*Caiman Rojo*, *Lobo Albino*, *Pantera Negra*), **Actividades del 100%** (*Flamencos de la Coca*, *Escaneos WAiNK*, *Cartas*, *Meditacion*, *Campos de Tiro*, *Drones*, *Saltos*, *Pesca*, *Golf*) y resumen del trofeo **A Long Road (100%)**.
- **Boveda de Coleccionables (`155` elementos):** medallas doradas, los 11 Ojos Secretos, fauna terrestre y marina, cartas coleccionables, comics, campos de tiro y lugares emblematicos.
- **Arsenal, Vehiculos y Matriculas (`130` elementos):** armas de fuego, pistolas, armamento pesado, equipo tactico, superdeportivos, muscle, clasicos, motos, embarcaciones, hidrodeslizadores y matriculas de Leonida y Gloriana.
- **Distritos e Iconos:** 48 rotulos de distritos/condados, insignias policiales e iconos interactivos para crear marcadores propios.
- **Progreso Persistente + Exportar/Importar JSON:** guarda automaticamente tus hallazgos, misiones completadas, pines propios, votos y notas en `localStorage` (compatible 100% con Vercel estatico).

## Despliegue en Vercel

El repositorio ya incluye [vercel.json](vercel.json) apuntando directamente a `public/` (activos optimizados en WebP y JPEG progresivo):

1. Importa este repositorio en [vercel.com/new](https://vercel.com/new).
2. Haz clic en **Deploy** (no requiere comandos de build ni variables de entorno).

O desde terminal con Vercel CLI:

```bash
npx vercel --prod
```

## Ejecucion Local

```bash
python serve.py
```

Abre `http://127.0.0.1:8765` en tu navegador.
