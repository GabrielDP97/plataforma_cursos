# Plan de Recursos — Programación 0485

Recursos necesarios para el desarrollo y entrega del curso: ficheros, proyectos, soluciones, cheat sheets.

## Resumen de Recursos

| Tipo | Cantidad | Estado |
|------|----------|--------|
| Módulos JSON | 15 | Creados |
| Lecciones | 62 | Definidas |
| Ejercicios con solución | 191 | Definidos |
| Vídeos planificados | 63 | Por producir |
| Proyectos starter | 15 | Por crear |
| Soluciones completas | 15 | Por crear |
| Cheat sheets | 6 | Por crear |

## Proyectos Starter (por módulo)

Cada módulo necesita un proyecto starter que el alumno descargue para empezar.

| Módulo | Proyecto Starter | Contenido |
|--------|------------------|-----------|
| mod-01 | proyecto-01-intro | Estructura de carpetas, HolaMundo.java |
| mod-02 | proyecto-02-entrada-salida | Clase con Scanner, plantilla de lectura |
| mod-03 | proyecto-03-seleccion | Plantilla con Scanner y switch |
| mod-04 | proyecto-04-repeticion | Plantilla con bucles y excepciones |
| mod-05 | proyecto-05-metodos | Clase con main y métodos vacíos |
| mod-06 | proyecto-06-clases | Estructura de paquetes, clases vacías |
| mod-07 | proyecto-07-encapsulacion | Clases con campos públicos (para encapsular) |
| mod-08 | proyecto-08-herencia | Clase Alumno existente (para extender) |
| mod-09 | proyecto-09-polimorfismo | Jerarquía de figuras (para completar) |
| mod-10 | proyecto-10-avanzado | Proyecto POO con patrones |
| mod-11 | proyecto-11-arrays | Datos de ejemplo en arrays |
| mod-12 | proyecto-12-colecciones | Listas de alumnos de ejemplo |
| mod-13 | proyecto-13-excepciones | Clases sin manejo de errores |
| mod-14 | proyecto-14-ficheros | Ficheros de datos de ejemplo |
| mod-15 | proyecto-15-final | Estructura de paquetes vacía |

## Soluciones Completas (por módulo)

Cada módulo necesita una carpeta de soluciones con todos los ejercicios resueltos.

```
soluciones/
├── mod-01/
│   ├── ex-01-1-1-HolaNombre.java
│   ├── ex-01-1-2-InfoPersonal.java
│   ├── ex-01-1-3-Recuadro.java
│   ├── ex-01-2-1-HolaMundoIDE.java
│   ├── ex-01-2-2-InfoSistema.java
│   ├── ex-01-2-3-ErroresCorregidos.java
│   ├── ... (todas las soluciones)
│   └── README.md (instrucciones)
├── mod-02/
│   ├── ex-02-1-1-SaludoPersonalizado.java
│   ├── ... (todas las soluciones)
│   └── README.md
├── ...
└── mod-15/
    ├── com/sgn/modelos/Alumno.java
    ├── com/sgn/modelos/Curso.java
    ├── com/sgn/modelos/Nota.java
    ├── com/sgn/excepciones/SGNException.java
    ├── com/sgn/persistencia/GestorPersistencia.java
    ├── com/sgn/app/AppPrincipal.java
    └── README.md
```

## Cheat Sheets

| Cheat Sheet | Contenido | Página estimada |
|-------------|-----------|-----------------|
| java-basics | Variables, tipos, operadores, if/else, bucles | 2 páginas |
| java-oop | Clases, constructores, herencia, interfaces | 2 páginas |
| java-collections | List, ArrayList, Iterator, Stream | 2 páginas |
| java-io | File, BufferedReader, BufferedWriter, Serialización | 1 página |
| java-exceptions | Try-catch, jerarquía, excepciones personalizadas | 1 página |
| java-generics | Genéricos, bounded types, type erasure | 1 página |

**Total: ~9 páginas de cheat sheets**

## Ficheros de Datos de Ejemplo

Para los módulos de E/S y persistencia, se necesitan ficheros de datos:

| Fichero | Módulo | Contenido |
|---------|--------|-----------|
| alumnos.txt | mod-14 | `Ana,8.5` por línea (CSV simple) |
| cursos.txt | mod-14 | `Programacion,120,30` por línea |
| notas.txt | mod-14 | Notas de ejemplo para lectura |
| alumnos.dat | mod-14 | Fichero serializado de prueba |
| informe.txt | mod-14 | Informe de ejemplo generado |

## Recursos Multimedia

| Recurso | Cantidad | Formato |
|---------|----------|---------|
| Vídeos de lección | 62 | MP4, 1080p |
| Miniaturas de vídeo | 62 | PNG, 1280x720 |
| Diagramas de clases | ~10 | SVG o PNG |
| Capturas de pantalla | ~30 | PNG |

## Plan de Contenido por Fase

### Fase 1 — Fundamentos (mod-01, mod-02)
- [ ] Proyecto starter mod-01
- [ ] Soluciones mod-01 (15 ejercicios)
- [ ] Cheat sheet java-basics
- [ ] Vídeos 5 (mod-01) + 3 (mod-02)

### Fase 2 — Control (mod-03, mod-04)
- [ ] Proyecto starter mod-03
- [ ] Proyecto starter mod-04
- [ ] Soluciones mod-03 (9 ejercicios)
- [ ] Soluciones mod-04 (15 ejercicios)
- [ ] Vídeos 3 (mod-03) + 5 (mod-04)

### Fase 3 — Métodos (mod-05)
- [ ] Proyecto starter mod-05
- [ ] Soluciones mod-05 (12 ejercicios)
- [ ] Vídeos 4

### Fase 4 — POO (mod-06 a mod-10)
- [ ] Proyectos starter mod-06 a mod-10
- [ ] Soluciones mod-06 a mod-10 (63 ejercicios)
- [ ] Cheat sheet java-oop
- [ ] Diagramas de jerarquías de clases
- [ ] Vídeos 21

### Fase 5 — Colecciones (mod-11, mod-12)
- [ ] Proyectos starter mod-11, mod-12
- [ ] Soluciones mod-11, mod-12 (27 ejercicios)
- [ ] Cheat sheet java-collections
- [ ] Cheat sheet java-generics
- [ ] Ficheros de datos de ejemplo
- [ ] Vídeos 9

### Fase 6 — Errores/Persistencia (mod-13, mod-14)
- [ ] Proyectos starter mod-13, mod-14
- [ ] Soluciones mod-13, mod-14 (21 ejercicios)
- [ ] Cheat sheet java-exceptions
- [ ] Cheat sheet java-io
- [ ] Ficheros de datos de ejemplo
- [ ] Vídeos 7

### Fase 7 — Proyecto final (mod-15)
- [ ] Proyecto starter mod-15 (estructura completa)
- [ ] Solución completa mod-15 (15 ejercicios + código final)
- [ ] Vídeos 5
- [ ] README del proyecto

## Estimación de Esfuerzo de Producción

| Tipo de recurso | Tiempo estimado por unidad | Total |
|-----------------|---------------------------|-------|
| Vídeo de lección | 4h de producción por vídeo | ~252h |
| Solución de ejercicio | 30 min por ejercicio | ~95.5h |
| Proyecto starter | 1h por proyecto | ~15h |
| Cheat sheet | 2h por hoja | ~12h |
| Ficheros de ejemplo | 30 min por fichero | ~2.5h |
| **Total estimado** | | **~372.5h** |

## Prioridad de Producción

1. **Alta**: Vídeos de las fases 1-4 (fundamentos y POO)
2. **Alta**: Soluciones de todos los módulos
3. **Media**: Vídeos de las fases 5-7
4. **Media**: Cheat sheets
5. **Baja**: Proyectos starter (pueden generarse con Eclipse IDE)
6. **Baja**: Ficheros multimedia (diagramas, capturas)
