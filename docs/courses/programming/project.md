# Proyecto Final — Sistema de Gestión de Notas

Proyecto integrador del módulo 15 que demuestra la adquisición de todos los Resultados de Aprendizaje del curso.

## Descripción

**Sistema de Gestión de Notas (SGN)**: aplicación de consola para gestionar alumnos, cursos y calificaciones en un instituto, con persistencia de datos en fichero.

## Objetivos del Proyecto

1. Demostrar dominio de todos los conceptos de programación en Java.
2. Aplicar diseño orientado a objetos con herencia, composición e interfaces.
3. Implementar persistencia de datos con serialización de objetos.
4. Documentar el código con Javadoc.
5. Crear una aplicación funcional con menú interactivo.

## Fases de Implementación

| Fase | Lección | Contenido | Conceptos Clave |
|------|---------|-----------|-----------------|
| 1 | 15-1 | Planificación y diseño | Requisitos, modelo de clases, paquetes |
| 2 | 15-2 | Modelo completo | Herencia, composición, genéricos, enum, excepciones |
| 3 | 15-3 | Lógica del negocio | Colecciones, streams, validación, menú |
| 4 | 15-4 | Persistencia y pruebas | Serialización, CSV, informes, testing |
| 5 | 15-5 | Documentación y entrega | Javadoc, README, refactorización |

## Modelo de Clases

```
com.sgn.modelos
├── Persona (abstracta, Serializable)
│   ├── Alumno (implements Comparable<Alumno>)
│   │   └── tiene HistorialAcademico
│   └── Profesor
├── Curso (Serializable)
│   └── contiene List<Alumno>
├── Nota (Serializable)
│   ├── tiene Curso (referencia)
│   ├── tiene double valor
│   └── tiene TipoEvaluacion (enum)
├── TipoEvaluacion (enum)
│   ├── EXAMEN, EJERCICIO, PROYECTO, CONTINUA
└── HistorialAcademico (Serializable)
    └── tiene List<Nota>

com.sgn.excepciones
├── SGNException (base, checked)
├── NotaInvalidaException
├── EmailInvalidoException
├── CursoLlenoException
├── AlumnoNoEncontradoException
└── NombreInvalidoException

com.sgn.persistencia
├── GestorPersistencia (serialización)
├── ExportadorCSV
└── GeneradorInformes

com.sgn.utilidades
├── ValidadorDatos (regex)
└── Constantes

com.sgn.app
└── AppPrincipal (menú y lógica)
```

## Funcionalidades

### Gestión de Alumnos
- Crear alumno (nombre, email, NIE) con validación
- Modificar datos de alumno
- Eliminar alumno (desmatricula de cursos automáticamente)
- Listar todos los alumnos
- Buscar por nombre o email

### Gestión de Cursos
- Crear curso (nombre, horas, capacidad máxima)
- Matricular alumno en curso (con control de capacidad)
- Desmatricular alumno
- Listar cursos con número de alumnos

### Gestión de Calificaciones
- Asignar nota a alumno en curso (0-10)
- Tipos de evaluación: Examen, Ejercicio, Proyecto, Evaluación continua
- Calcular media por alumno
- Calcular media por asignatura
- Listar notas de un alumno

### Informes
- Listado de alumnos aprobados/suspensos
- Ranking de alumnos por nota media
- Informe por curso con estadísticas

### Persistencia
- Guardar datos en fichero (serialización de objetos)
- Cargar datos al iniciar
- Exportar a CSV
- Generar informe de texto formateado
- Backup automático antes de sobrescribir

## Tecnología Utilizada

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Java 21 LTS |
| IDE | Eclipse IDE for Java Developers |
| Persistencia | Serialización de objetos (ObjectOutputStream) |
| Exportación | CSV con PrintWriter |
| Informes | Texto formateado con printf |
| Validación | Expresiones regulares (Pattern, Matcher) |
| Colecciones | List, ArrayList, Stream API |
| Excepciones | Jerarquía personalizada (checked) |
| Documentación | Javadoc completo |

## Estructura del Proyecto

```
src/
└── com/
    └── sgn/
        ├── modelos/
        │   ├── Persona.java
        │   ├── Alumno.java
        │   ├── Profesor.java
        │   ├── Curso.java
        │   ├── Nota.java
        │   ├── TipoEvaluacion.java
        │   └── HistorialAcademico.java
        ├── excepciones/
        │   ├── SGNException.java
        │   ├── NotaInvalidaException.java
        │   ├── EmailInvalidoException.java
        │   ├── CursoLlenoException.java
        │   └── AlumnoNoEncontradoException.java
        ├── persistencia/
        │   ├── GestorPersistencia.java
        │   ├── ExportadorCSV.java
        │   └── GeneradorInformes.java
        ├── utilidades/
        │   ├── ValidadorDatos.java
        │   └── Constantes.java
        └── app/
            └── AppPrincipal.java
```

## Menú Interactivo

```
=== SISTEMA DE GESTION DE NOTAS ===
 Curso 2026/2027

1 - Añadir alumno
2 - Añadir curso
3 - Matricular alumno en curso
4 - Asignar nota
5 - Mostrar alumnos
6 - Mostrar cursos
7 - Mostrar estadísticas
8 - Exportar a CSV
9 - Guardar datos
10 - Cargar datos
0 - Salir
```

## Criterios de Evaluación Cubiertos

El proyecto integra **todos los RAs y CEs** del curso (RA1-RA9, 79 CEs).

| RA | Cómo se demuestra |
|----|-------------------|
| RA1 | Código bien estructurado, comentarios, naming conventions |
| RA2 | Uso correcto de tipos, variables, operadores |
| RA3 | Estructuras de control en lógica del menú y validación |
| RA4 | Modelo de clases con encapsulación completa |
| RA5 | E/S con ficheros, serialización, CSV |
| RA6 | Colecciones (List), arrays, streams |
| RA7 | Herencia (Persona→Alumno), polimorfismo, interfaces (Comparable) |
| RA8 | Integración de todos los conceptos en un sistema funcional |
| RA9 | Javadoc completo, README.md |
