# GTA VI — Atlas y Guía Interactiva de Leonida

Mapa interactivo completo y guía práctica del Estado de Leonida para **Grand Theft Auto VI**, desplegado en **Vercel** en https://gta6-leonida-atlas.vercel.app con carga rápida, soporte PWA instalable y guardado automático del progreso en el navegador.

## Contenido Incluido

- **Mapa Completo de Leonida (Modo Noche y Modo Día):**
  - Navegación fluida con zoom hasta nivel de calle, soporte táctil (*pinch-to-zoom* en móvil/tablet), radar interactivo en esquina, cuadrícula táctica (`A-1` a `M-9`) y salto rápido a los 5 condados y cayos (**Vice City**, **Port Gellhorn**, **Mount Kalaga**, **Ambrosia**, **Grassrivers** y **Leonida Keys**).
  - **126 ubicaciones verificadas** sobre el mapa, cada una con indicaciones prácticas (*Cómo aprovechar este lugar*), rótulos de distrito, enlaces directos para compartir (`?pin=...`) y notas comunitarias.
  - **Medidor de Ruta GPS (`Tecla M`):** traza rutas multipunto con distancia real en millas y kilómetros.
- **Buscador Global Instantáneo (`Ctrl+K`):**
  - Busca al instante —sin preocuparte por tildes— entre las 126 ubicaciones, 36 eventos, manuales de mecánicas, trofeos, 152 coleccionables, 130 armas/vehículos y 48 distritos.
- **Eventos, Extraños y Locos y Actividades (`36` guías paso a paso):**
  - Historias secundarias y peristas: **Kirk y el Skunk Ape (*Mr. Mangrove*)**, **Bret Vogel (*Killtelligence Provisions*)**, **Kenton Rees**, **Kyle**, **Yago**, **Pilot Pete**, **Randy**, **Tyrone**, **Billy**, **Andy**, **Shirley** (perdible), **Moses** y **Yasmani**.
  - **Eventos Aleatorios** (incluyendo bolsas de bandas rivales de `$1.000–$15.000`), **Caza Legendaria** (*Caimán Rojo*, *Lobo Albino*, *Pantera Negra*), **Golpes a Bancos y Blindados**, **Actividades del 100%** (*Flamencos de la Coca*, *Escaneos WAiNK*, *Cartas*, *Meditación*, *Campos de Tiro*, *Drones*, *Saltos*, *Pesca*, *Golf*) y resumen del trofeo **A Long Road (100%)**.
- **Guía Práctica ("Cómo Hacerlo") y Trofeos:**
  - **7 manuales paso a paso:** sistema de 4 armas y maletero, Modo Enfoque (`L3 + R3`), cómo ganar dinero por capítulos, robos limpios y Perfil Criminal, caza perfecta con Bret Vogel, ruta del 100% y uso del atlas.
  - **Checklist interactivo de 26 trofeos y logros clave** con alertas de perdibles (como la meditación del balcón en el Capítulo 1 y *Race Against Yago* en el Capítulo 3).
- **Bóveda de Coleccionables (`152` elementos) y Arsenal/Garaje (`130` elementos):**
  - Cada ficha incluye indicaciones concretas de **cómo conseguirlo / dónde usarlo** y botón directo **Ver en Mapa**.
- **Distritos e Iconos:** 48 rótulos de distritos/condados, insignias policiales e iconos interactivos para crear marcadores propios.
- **Progreso Persistente + Exportar/Importar JSON + PWA:** guarda automáticamente tus hallazgos, misiones, trofeos, pines propios, votos y notas en `localStorage`.

## Despliegue en Vercel

El repositorio incluye [vercel.json](vercel.json) apuntando directamente a `public/` (activos optimizados en WebP y JPEG progresivo). Cada `git push` a `main` actualiza automáticamente el sitio en producción.

## Ejecución Local

```bash
python serve.py
```

Abre `http://127.0.0.1:8765` en tu navegador.
