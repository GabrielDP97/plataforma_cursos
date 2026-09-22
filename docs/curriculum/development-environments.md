# Blueprint — Entornos de Desarrollo (0487)

## Module Header

| Campo | Valor |
|-------|-------|
| **Código** | 0487 |
| **Nombre** | Entornos de desarrollo |
| **ECTS** | 6 |
| **Horas** | 50 |
| **Titulaciones** | DAM + DAW (compartido) |
| **Regulación** | RD 405/2023, ANEXO I |

> **Aviso importante:** Este módulo NO es un curso de Git ni de una herramienta específica. Cubre IDE, herramientas de desarrollo, testing, debugging, documentación, control de versiones y diagramas UML. Las metodologías ágiles se mencionan en el currículo como referencia. Los diagramas (clases y comportamiento) son CONTENIDO OFICIAL.

---

## Resultados de Aprendizaje y Criterios de Evaluación

| RA | Descripción | CEs |
|----|-------------|-----|
| **RA1** | Reconoce los elementos y herramientas que intervienen en el desarrollo de un programa | 7 |
| **RA2** | Evalúa entornos integrados de desarrollo analizando sus características | 7 |
| **RA3** | Verifica el funcionamiento de programas diseñando y realizando pruebas | 9 |
| **RA4** | Optimiza código empleando las herramientas disponibles en el entorno de desarrollo | 9 |
| **RA5** | Genera diagramas de clases valorando su importancia | 6 |
| **RA6** | Genera diagramas de comportamiento valorando su importancia | 8 |
| | **Total** | **46** |

---

## Contenidos Oficiales

1. Desarrollo de software
2. Instalación y uso de entornos de desarrollo
3. Diseño y realización de pruebas
4. Optimización y documentación
5. Elaboración de diagramas de clases
6. Elaboración de diagramas de comportamiento

---

## Unidades Pedagógicas Propuestas

> **Nota:** Esta organización en unidades es NUESTRA propuesta didáctica. No es la secuencia oficial del currículo.

### Unidad 1 — El proceso de desarrollo y herramientas

**Descripción:** Introducción al proceso de desarrollo de software, las herramientas que intervienen y los entornos de desarrollo integrados (IDE). El alumno comprende el ciclo de vida del software y las herramientas que lo soportan.

**RAs cubiertos:** RA1, RA2  
**CEs cubiertos:** 7 + 7 = 14  
**Contenidos cubiertos:** Desarrollo de software, Instalación y uso de entornos de desarrollo

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 1.1 | Ciclo de vida del software | Modelos: cascada, iterativo, ágil. Fases: análisis, diseño, implementación, pruebas, mantenimiento. Metodologías ágiles (Scrum, Kanban) como referencia |
| 1.2 | Herramientas de desarrollo | Compiladores, intérpretes, editores de código, terminales, herramientas de build. La cadena de herramientas |
| 1.3 | IDEs: qué son y por qué existen | Definición de IDE. Características: editor, depurador, autocompletado, refactorización. Comparativa: VS Code, IntelliJ, Eclipse, NetBeans |
| 1.4 | Instalación y configuración del IDE | Instalar IDE (Eclipse IDE for Java Developers). Extensiones. Configuración de proyecto. Interfaz: editor, terminal, explorador, panel de depuración |
| 1.5 | Control de versiones (introducción) | Qué es un sistema de control de versiones. Git como estándar. Conceptos: repositorio, commit, rama, merge. No profundizar: es herramienta, no objetivo |

**Ejercicios recomendados:**
- Mapear las herramientas usadas en un proyecto real a las categorías del ciclo de vida
- Instalar y configurar IDE con extensiones relevantes
- Crear, editar y ejecutar un programa simple desde el IDE
- Inicializar repositorio Git y hacer commit de un proyecto existente

---

### Unidad 2 — Verificación y pruebas

**Descripción:** El alumno diseña y realiza pruebas para verificar el funcionamiento de programas. Se cubren tipos de testing, diseño de casos de prueba y uso de herramientas de testing del IDE.

**RAs cubiertos:** RA3  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Diseño y realización de pruebas

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 2.1 | ¿Por qué testear? | Coste de los errores. Testing vs debugging. Niveles: unidad, integración, sistema, aceptación. Test-driven development (concepto) |
| 2.2 | Pruebas unitarias | Qué es una prueba unitaria. Frameworks de testing (JUnit, pytest, NUnit). Arrange-Act-Assert. Assertions |
| 2.3 | Diseño de casos de prueba | Particiones de equivalencia, valores límite, tabla de decisiones. Redactar casos de prueba formales. Cobertura de código |
| 2.4 | Herramientas de testing en IDE | Ejecutar tests desde el IDE. Ver resultados. Tests que fallan. Debugging de tests. Cobertura de código |
| 2.5 | Práctica: testear un módulo | Dado un módulo simple, diseñar casos de prueba, implementarlos y ejecutarlos. Analizar cobertura |

**Ejercicios recomendados:**
- Escribir 10 casos de prueba para una función de validación de email
- Implementar pruebas unitarias con framework de testing
- Ejecutar suite de tests y analizar resultados (pasan/fallan)
- Mejorar cobertura de código identificando ramas no testeadas

---

### Unidad 3 — Depuración y optimización

**Descripción:** El alumno optimiza código empleando las herramientas disponibles en el IDE: debugger, profiler, refactorización. Se enfatiza que optimizar SIN MEDIR es adivinar.

**RAs cubiertos:** RA4  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Optimización y documentación

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 3.1 | Depuración (debugging) | Puntos de interrupción, paso a paso (step into/over/out), inspección de variables, call stack. Debugger del IDE |
| 3.2 | Errores y excepciones | Tipos de errores (sintaxis, lógico, runtime). Manejo de excepciones. Stack traces. Logging |
| 3.3 | Análisis de rendimiento | Profiling: qué es y por qué. Herramientas de profiling. Métricas: tiempo de ejecución, uso de memoria, CPU |
| 3.4 | Refactorización | Código smell. Extraer método, renombrar variable, mover código. Refactorización automatizada en IDE |
| 3.5 | Documentación de código | Comentarios: inline, docstrings, JSDoc. Documentación de API. README. Generación de documentación automática |

**Ejercicios recomendados:**
- Depurar programa con 3 errores introducidos (usar debugger, no print)
- Identificar y corregir código smell en un módulo dado
- Optimizar función lenta identificando cuello de botella con profiler
- Documentar módulo completo con comentarios y documentación externa

---

### Unidad 4 — Diagramas de clases (UML)

**Descripción:** El alumno genera diagramas de clases UML valorando su importancia para el diseño de software. Se cubren clases, atributos, métodos, relaciones y visibilidad.

**RAs cubiertos:** RA5  
**CEs cubiertos:** 6  
**Contenidos cubiertos:** Elaboración de diagramas de clases

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 4.1 | UML y diagramas | Qué es UML. Tipos de diagramas. Diagrama de clases como herramienta de diseño. Notación UML |
| 4.2 | Clases y objetos | Clase: nombre, atributos, métodos. Visibilidad (+, -, #, ~). Objetos: instancia de clase. Convenciones de naming |
| 4.3 | Relaciones entre clases | Asociación, agregación, composición, herencia, implementación de interfaz. Cardinalidad. Navegabilidad |
| 4.4 | Patrones de diseño básicos | Singleton, Factory, Observer, MVC. No como objetivo final, sino como ejemplos de por qué los diagramas importan |
| 4.5 | Práctica: modelar sistema | Dado un caso de uso (biblioteca, tienda), generar diagrama de clases completo. Herramientas: Draw.io, PlantUML, mermaid |

**Ejercicios recomendados:**
- Dibujar diagrama de clases para sistema de gestión de alumnos
- Identificar relaciones (asociación, herencia, composición) en código existente
- Convertir diagrama de clases a código (esqueleto de clases)
- Refactorizar código dado un diagrama de clases mejorado

---

### Unidad 5 — Diagramas de comportamiento (UML)

**Descripción:** El alumno genera diagramas de comportamiento UML: casos de uso, secuencia, actividad y estados. Se valoran como herramienta de comunicación entre roles técnicos y no técnicos.

**RAs cubiertos:** RA6  
**CEs cubiertos:** 8  
**Contenidos cubiertos:** Elaboración de diagramas de comportamiento

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 5.1 | Diagrama de casos de uso | Actores, casos de uso, relaciones (include, extend, generalización). Cuándo usar casos de uso. Notación UML |
| 5.2 | Diagrama de secuencia | Lifelines, mensajes síncronos/asíncronos, bucles, alternativas. Secuencia de interacción objeto a objeto |
| 5.3 | Diagrama de actividad | Nodos, flujo de control, fork/join, decisiones. Flujo de proceso. Equivalencia con diagramas de flujo |
| 5.4 | Diagrama de estados | Estados, transiciones, eventos, acciones. Ciclo de vida de un objeto. Estados compuestos |
| 5.5 | Práctica: documentar comportamiento | Dado un sistema (ej: proceso de compra), generar: diagrama de casos de uso, secuencia para un caso concreto, actividad para el proceso |

**Ejercicios recomendados:**
- Crear diagrama de casos de uso para sistema de gestión de cursos
- Dibujar secuencia de interacción para ".usuario inicia sesión"
- Modelar flujo de proceso de inscripción con diagrama de actividad
- Representar estados de un pedido con diagrama de estados

---

## Matriz de Cobertura

| Contenido oficial | Unidad | RAs | CEs |
|-------------------|--------|-----|-----|
| Desarrollo de software | U1 | RA1 | 7 |
| Instalación y uso de entornos de desarrollo | U1 | RA2 | 7 |
| Diseño y realización de pruebas | U2 | RA3 | 9 |
| Optimización y documentación | U3 | RA4 | 9 |
| Elaboración de diagramas de clases | U4 | RA5 | 6 |
| Elaboración de diagramas de comportamiento | U5 | RA6 | 8 |
| **Total** | **5 unidades** | **6 RAs** | **46 CEs** |

---

## Evaluación

> **Estado:** PLACEHOLDER — Pendiente de diseño del plan de evaluación.

### Criterios generales a definir

- [ ] Contribución de cada unidad a la nota final
- [ ] Tipo de ejercicios evaluables (prácticas, proyectos, exámenes teóricos)
- [ ] Rúbricas de evaluación por tipo de ejercicio
- [ ] Criterios de evaluación específicos por RA
- [ ] Proporción teoría / práctica
- [ ] Recuperación y segunda convocatoria

### Mapa de evaluación por RA (borrador)

| RA | Evaluación sugerida | Peso aprox. |
|----|---------------------|-------------|
| RA1 | Cuestionario teórico + mapeo de herramientas | 10% |
| RA2 | Evaluación comparativa de 2 IDEs | 12% |
| RA3 | Práctica: diseño e implementación de pruebas | 22% |
| RA4 | Práctica: debugging + optimización de código | 22% |
| RA5 | Ejercicio: diagrama de clases UML | 15% |
| RA6 | Ejercicio: diagramas de comportamiento UML | 19% |

---

*Blueprint generado el 2026-09-17. Basado en RD 405/2023, ANEXO I.*
