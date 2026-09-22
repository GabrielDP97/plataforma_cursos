# Enfoque Pedagógico — Programación 0485

Decisión pedagógicas del curso: progresión, dominio, justificaciones técnicas y estrategias de enseñanza.

## Progresión de Aprendizaje

El curso sigue una progresión de **simplicidad a complejidad**:

```
Fase 1: Qué es un programa → Variables → Operadores → E/S básica
    ↓
Fase 2: Si/entonces → Bucles → Excepciones básicas
    ↓
Fase 3: Métodos → Parámetros → Scope → Sobrecarga
    ↓
Fase 4: Clases → Constructores → Encapsulación → Herencia → Polimorfismo → Interfaces
    ↓
Fase 5: Arrays → Matrices → Colecciones → Genéricos → Regex
    ↓
Fase 6: Excepciones avanzadas → Ficheros → Serialización
    ↓
Fase 7: Proyecto integrador que usa TODO
```

Cada fase se construye sobre la anterior. No se salta ninguna fase.

## Dominio Utilizado: Alumno / Curso / Matrícula / Nota

El curso usa un **dominio coherente y progresivo**:

| Concepto | Se introduce en | Ejemplo de uso |
|----------|-----------------|----------------|
| Alumno | mod-01 (variables) | `String nombre = "Ana"` |
| Curso | mod-01 (variables) | `String curso = "Programación"` |
| Alumno como clase | mod-06 | `class Alumno { String nombre; ... }` |
| Constructor de Alumno | mod-06 | `new Alumno("Ana", "ana@email.com")` |
| Alumno encapsulado | mod-07 | `private String nombre` + getters/setters |
| AlumnoBecario | mod-08 | `extends Alumno` (herencia) |
| Alumno como interfaz | mod-09 | `implements Comparable<Alumno>` |
| Alumno en arrays | mod-11 | `Alumno[] alumnos = new Alumno[5]` |
| Alumno en colecciones | mod-12 | `List<Alumno> alumnos = new ArrayList<>()` |
| Alumno serializable | mod-14 | `implements Serializable` |
| Alumno en proyecto final | mod-15 | Sistema completo con validación |

**Ventaja**: el alumno nunca tiene que aprender un nuevo dominio. Solo amplía lo que ya conoce.

## Justificación de Java 21 LTS

| Criterio | Decisión |
|----------|----------|
| LTS | Java 21 es la versión LTS vigente (septiembre 2023 - marzo 2028) |
| Estabilidad | Versiones LTS tienen soporte extendido de seguridad |
| Novedades útiles | Records, pattern matching, text blocks, switch expressions |
| Employability | Java sigue siendo uno de los lenguajes más demandados en el mercado laboral europeo |
| Compatibilidad | Eclipse IDE soporta Java 21 de forma nativa |
| Ecosistema | Todas las librerías y frameworks relevantes soportan Java 21 |

## Justificación de Eclipse IDE for Java Developers

| Criterio | Decisión |
|----------|----------|
| Gratuito | Eclipse IDE for Java Developers es completamente gratuito |
| Especializado en Java | Excelente soporte de autocompletado, depuración y refactoring para Java |
| Depurador visual | Permite ver variables en tiempo real, breakpoints, paso a paso |
| Correcciones rápidas | Sugiere soluciones automáticas para errores comunes |
| Industry standard | Es uno de los IDEs más utilizados en la industria Java |
| Extensible | Plugins para Git, Maven, JUnit, etc. |

## Estrategia de Errores Comunes

Cada lección incluye una sección `commonErrors` con los errores más frecuentes. Patrón:

1. **Identificar el error**: descripción clara de qué sucede.
2. **Explicar por qué**: la razón técnica detrás del error.
3. **Mostrar la solución**: código correcto y explicación.

Ejemplo del curso:
- **Error**: `if (x = 5)` — asignación en vez de comparación.
- **Por qué**: `=` es asignación, `==` es comparación. El compilador no da error porque `int` se promueve a `boolean`.
- **Solución**: `if (x == 5)`.

## Clasificación de Ejercicios

| Dificultad | Descripción | Proporción |
|------------|-------------|------------|
| **basic** | Aplicación directa del concepto visto en la lección. Copia guiada. | ~33% |
| **intermediate** | Combinación de 2+ conceptos. Requiere razonamiento. | ~44% |
| **advanced** | Resolución de problemas nuevos. Diseño propio. Casos extremos. | ~23% |

Cada lección tiene al menos 3 ejercicios (1 basic, 1 intermediate, 1 advanced).

## Prácticas por Módulo

Cada módulo termina con una práctica integradora que combina los conceptos del módulo:

| Módulo | Práctica |
|--------|----------|
| mod-01 | — |
| mod-02 | Registro de alumnos interactivo |
| mod-03 | Simulador de examen con calificación |
| mod-04 | Juego de adivinar número |
| mod-05 | Calculadora modular con métodos |
| mod-06 | Sistema de gestión de alumnos con objetos |
| mod-07 | Sistema encapsulado con paquetes |
| mod-08 | Jerarquía de vehículos con herencia |
| mod-09 | Sistema de empleados con polimorfismo |
| mod-10 | Proyecto POO completo |
| mod-11 | Sistema de gestión de notas con arrays |
| mod-12 | Colecciones y persistencia en memoria |
| mod-13 | Sistema con manejo robusto de excepciones |
| mod-14 | Persistencia de datos con ficheros |
| mod-15 | Proyecto integrador final |

## Principios de Diseño Pedagógico

1. **Teoría mínima, práctica máxima**: cada concepto se explica en < 5 minutos de lectura.
2. **Ejemplos ejecutables**: todo el código de ejemplo es compilable y ejecutable.
3. **Progresión visible**: el alumno ve cómo su código evoluciona de módulo en módulo.
4. **Errores como aprendizaje**: los errores comunes se documentan explícitamente.
5. **Dominio real**: el dominio Alumno/Curso/Matrícula es cercano al alumno (está en un instituto).
