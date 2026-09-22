# Blueprint: Programación (0485) — DAM/DAW 1.º

> **Estado:** Borrador para revisión humana
> **Última actualización:** 2026-09-17
> **Proyecto:** Plataforma Cursos FP

---

## Datos oficiales del módulo

| Campo | Valor |
|-------|-------|
| **Código** | 0485 |
| **Nombre oficial** | Programación |
| **Titulaciones** | DAM + DAW (compartido, idéntico) |
| **Curso** | 1.º |
| **ECTS** | 14 |
| **Horas totales** | 135 |
| **Horas semanales** | ~4,5 (30 semanas) |
| **Fuente** | Real Decreto 405/2023, BOE-A-2023-13221, ANEXO I |

> **Nota sobre lenguaje:** El módulo oficial NO especifica un lenguaje de programación concreto. Nuestra decisión didáctica es **Java** por su alineación con la terminología POO del currículo (clases, objetos, herencia, paquetes) y su uso predominante en FP de DAM/DAW.

---

## Resultados de aprendizaje y criterios de evaluación

### RA1 — Reconoce la estructura de un programa informático

| CE | Criterio |
|----|----------|
| a | Bloques de un programa |
| b | Proyectos de desarrollo |
| c | Entornos integrados de desarrollo |
| d | Tipos de variables |
| e | Crear y utilizar variables |
| f | Constantes y literales |
| g | Operadores y expresiones |
| h | Conversiones de tipo |
| i | Comentarios |

### RA2 — Escribe y prueba programas sencillos (fundamentos POO)

| CE | Criterio |
|----|----------|
| a | Fundamentos de la programación orientada a objetos |
| b | Programas simples |
| c | Instanciar objetos |
| d | Métodos y propiedades |
| e | Métodos estáticos |
| f | Parámetros |
| g | Librerías de objetos |
| h | Constructores |
| i | IDE para creación y compilación |

### RA3 — Escribe y depura código (estructuras de control)

| CE | Criterio |
|----|----------|
| a | Selección |
| b | Repetición |
| c | Salto |
| d | Excepciones |
| e | Crear programas con estructuras de control |
| f | Probar y depurar |
| g | Comentar y documentar |
| h | Crear excepciones |
| i | Aserciones |

### RA4 — Desarrolla programas organizados en clases (POO aplicada)

| CE | Criterio |
|----|----------|
| a | Sintaxis de clase |
| b | Definir clases |
| c | Propiedades y métodos |
| d | Constructores |
| e | Instanciar y usar objetos |
| f | Visibilidad |
| g | Clases heredadas |
| h | Métodos estáticos |
| i | Conjuntos y librerías de clases |

### RA5 — Realiza operaciones de E/S

| CE | Criterio |
|----|----------|
| a | Consola E/S |
| b | Formatos de visualización |
| c | Posibilidades E/S y librerías |
| d | Ficheros |
| e | Diversos métodos de acceso a ficheros |
| f | Interfaces gráficas simples |
| g | Controladores de eventos |
| h | Programas con interfaces gráficas |

### RA6 — Manipula información con tipos avanzados de datos

| CE | Criterio |
|----|----------|
| a | Matrices (arrays) |
| b | Librerías de tipos avanzados |
| c | Listas |
| d | Iteradores |
| e | Características de colecciones |
| f | Clases y métodos genéricos |
| g | Expresiones regulares |
| h | Tratamiento de documentos de intercambio de datos |
| i | Manipulaciones sobre documentos |
| j | Operaciones agregadas |

### RA7 — Características avanzadas de lenguajes OO

| CE | Criterio |
|----|----------|
| a | Herencia, superclase, subclase |
| b | Modificadores de herencia |
| c | Constructores en herencia |
| d | Sobreescritura de métodos |
| e | Jerarquías de clases |
| f | Probar jerarquías |
| g | Programas con jerarquías |
| h | Documentar código |
| i | Escenarios de uso de interfaces |
| j | Herencia vs composición |

### RA8 — Bases de datos orientadas a objetos

| CE | Criterio |
|----|----------|
| a | Características BDOO |
| b | Aplicación en desarrollo |
| c | Instalar gestores BDOO |
| d | Métodos de gestión |
| e | Crear BD y estructuras |
| f | Almacenar objetos |
| g | Recuperar/actualizar/eliminar objetos |
| h | Tipos de datos estructurados |

### RA9 — Gestión de información en bases de datos

| CE | Criterio |
|----|----------|
| a | Características y métodos de acceso |
| b | Programar conexiones |
| c | Almacenar información |
| d | Recuperar y mostrar información |
| e | Borrados y modificaciones |
| f | Aplicaciones que muestren información |
| g | Aplicaciones para gestionar información |

---

## Contenidos oficiales

| # | Sección oficial |
|---|----------------|
| 1 | Identificación de los elementos de un programa informático |
| 2 | Utilización de objetos |
| 3 | Uso de estructuras de control |
| 4 | Desarrollo de clases |
| 5 | Lectura y escritura de información |
| 6 | Aplicación de las estructuras de almacenamiento |
| 7 | Utilización avanzada de clases |
| 8 | Mantenimiento de la persistencia de los objetos |
| 9 | Gestión de bases de datos |

---

## Unidades pedagógicas propuestas

> **Importante:** Estas unidades SON NUESTRA organización didáctica. El currículo oficial define RAs, CEs y contenidos, pero NO secuencia ni unidades.

---

### Unidad 1 — Introducción a la programación y el entorno

**Descripción:** Primer contacto con la programación. Estructura de un programa, entorno de desarrollo, compilación y ejecución.

**RAs cubiertos:** RA1, RA2 (parcial)
**CEs cubiertos:** RA1: a, b, c, d, e, f, g, h, i · RA2: b, i
**Contenidos oficiales:** 1

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 1.1 | ¿Qué es un programa? | Identificar componentes de un programa; distinguir código fuente, bytecode y ejecutable | `text` explicación · `code` ejemplo "Hola Mundo" · `video` demo IDE |
| 1.2 | El entorno de desarrollo (IDE) | Instalar y configurar Eclipse IDE; compilar, ejecutar y depurar | `video` walkthrough IDE · `text` pasos · `link` documentación Eclipse IDE |
| 1.3 | Variables, tipos y constantes | Declarar variables primitivas; entender tipos `int`, `double`, `String`, `boolean`; usar `final` | `text` tabla de tipos · `code` ejemplos · `file` hoja de referencia tipos |
| 1.4 | Operadores y expresiones | Aritméticos, relacionales, lógicos; precedencia; casting explícito | `code` operadores · `text` tabla precedencia · `video` demo |
| 1.5 | Comentarios y documentación | Comentarios de línea, bloque y Javadoc | `code` ejemplos Javadoc · `link` Oracle Javadoc guide |

#### Ejercicios

- **Básico:** Declarar variables de cada tipo y mostrarlas por consola con `System.out.println()`
- **Intermedio:** Calcular el área de figuras geométricas usando operadores y expresiones
- **Consolidación:** Mini-calculadora que lea dos valores y muestre todas las operaciones aritméticas

#### Práctica recomendada
Configurar el IDE, crear el primer proyecto, compilar y ejecutar "Hola Mundo". Familiarizarse con la terminal del IDE.

---

### Unidad 2 — Entrada/salida básica y formateo

**Descripción:** Interacción con el usuario por consola, formateo de salida y primeras interacciones de E/S.

**RAs cubiertos:** RA5 (parcial), RA1 (refuerzo)
**CEs cubiertos:** RA5: a, b, c · RA1: e, g
**Contenidos oficiales:** 1 (refuerzo), 5 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 2.1 | Lectura por consola | Usar `Scanner` para leer datos del usuario | `code` Scanner · `text` tipos de entrada · `video` demo |
| 2.2 | Formateo de salida | `System.out.printf()`, `String.format()`, formato numérico y de fechas | `code` ejemplos printf · `text` tabla de formatos |
| 2.3 | E/S con librerías | Explorar posibilidades de E/S beyond consola | `text` overview · `link` Java I/O tutorial |

#### Ejercicios

- **Básico:** Programa que pregunte nombre, edad y muestre un saludo formateado
- **Intermedio:** Conversor de temperatura (Celsius ↔ Fahrenheit) con entrada y salida formateada
- **Consolidación:** Registro simple de usuario: leer datos, validar formato, mostrar resumen

#### Práctica recomendada
Crear un programa interactivo que pida datos al usuario y formatee la salida como una ficha/tabla.

---

### Unidad 3 — Estructuras de control: selección

**Descripción:** Toma de decisiones con `if`, `else if`, `else`, `switch` y expresiones condicionales.

**RAs cubiertos:** RA3 (parcial)
**CEs cubiertos:** RA3: a, e, g
**Contenidos oficiales:** 3 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 3.1 | Condicionales simples | `if`, `else`; operador ternario | `code` ejemplos · `text` diagrama flujo |
| 3.2 | Condicionales múltiples | `else if`, `switch`, expresiones `switch` (Java 14+) | `code` switch · `video` demo · `text` cuándo usar cada uno |
| 3.3 | Depuración con condicionales | Estrategias de testing con断点 y watches | `video` demo depuración · `text` estrategias |

#### Ejercicios

- **Básico:** Par/impar, mayor de edad, clasificación de nota
- **Intermedio:** Calculadora con menú de opciones usando `switch`
- **Consolidación:** Sistema de tarifas: dado un tipo de cliente y consumo, calcular precio con descuentos

#### Práctica recomendada
Programa de menú interactivo que combine entrada de datos con múltiples decisiones.

---

### Unidad 4 — Estructuras de control: repetición y excepciones

**Descripción:** Bucles (`for`, `while`, `do-while`), control de flujo (`break`, `continue`) y manejo de excepciones.

**RAs cubiertos:** RA3 (completo)
**CEs cubiertos:** RA3: b, c, d, e, f, h, i
**Contenidos oficiales:** 3 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 4.1 | Bucles `for` y `for-each` | Repetición controlada; recorrer arrays | `code` ejemplos · `text` diagrama flujo · `video` demo |
| 4.2 | Bucles `while` y `do-while` | Repetición condicional; sentinelas | `code` ejemplos · `text` comparación while vs do-while |
| 4.3 | `break`, `continue` y bucles anidados | Control de flujo; salir de bucles; saltar iteraciones | `code` ejemplos · `text` diagramas |
| 4.4 | Excepciones | `try`, `catch`, `finally`, `throw`, crear excepciones propias; tipos checked/unchecked | `code` ejemplo completo · `text` jerarquía excepciones · `link` Java Exception tutorial |
| 4.5 | Aserciones | Usar `assert` para validación en desarrollo | `code` ejemplos · `text` cuándo usar aserciones vs excepciones |

#### Ejercicios

- **Básico:** Tabla de multiplicar, suma de N números, contar dígitos
- **Intermedio:** Validación de entrada con reintento (bucle + excepción)
- **Consolidación:** Juego de adivinanza con número de intentos limitado y manejo de errores

#### Práctica recomendada
Programa que combine bucles y excepciones: validar entrada de datos con múltiples intentos.

---

### Unidad 5 — Programación orientada a objetos: clases y objetos

**Descripción:** Primer contacto con POO. Definir clases, crear objetos, métodos, constructores y encapsulación básica.

**RAs cubiertos:** RA2, RA4 (parcial)
**CEs cubiertos:** RA2: a, b, c, d, e, f, g, h · RA4: a, b, c, d, e, f (parcial)
**Contenidos oficiales:** 2, 4 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 5.1 | ¿Qué es la POO? | Conceptos: clase, objeto, atributo, método; diferencia clase vs objeto | `text` explicación conceptual · `code` ejemplo `Persona` · `video` analogía |
| 5.2 | Definir clases | Sintaxis de clase, atributos, métodos, visibilidad (`public`, `private`) | `code` clase completa · `text` normas de naming |
| 5.3 | Constructores | Constructor por defecto, parametrizado; sobrecarga; `this` | `code` ejemplos · `text` tabla constructores |
| 5.4 | Métodos y propiedades | Getters/setters; métodos de comportamiento; métodos estáticos | `code` ejemplo POO · `video` demo refactoring |
| 5.5 | Encapsulación | Modificadores de acceso; principio de encapsulamiento;-validate-setter-pattern | `text` principios · `code` antes/después · `file` ejercicio guiado |

#### Ejercicios

- **Básico:** Crear clase `Coche` con atributos, constructor y método `arrancar()`
- **Intermedio:** Clase `CuentaBancaria` con depósito, retiro y saldo (validación interna)
- **Consolidación:** Sistema de biblioteca: clase `Libro` y clase `Biblioteca` con operaciones CRUD básicas

#### Práctica recomendada
Crear un modelo de dominio simple (3-4 clases relacionadas) con interacción por consola.

---

### Unidad 6 — Clases, visibilidad y librerías de clases

**Descripción:** Profundizar en diseño de clases, paquetes, visibilidad, métodos estáticos y organización de código.

**RAs cubiertos:** RA4 (completo), RA2 (refuerzo)
**CEs cubiertos:** RA4: a, b, c, d, e, f, g, h, i · RA2: e, i
**Contenidos oficiales:** 2 (refuerzo), 4 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 6.1 | Paquetes y organización | Crear paquetes; importar clases; convenciones de naming | `code` estructura paquetes · `text` convenciones |
| 6.2 | Visibilidad profunda | `public`, `protected`, package-private, `private`; cuándo usar cada uno | `text` tabla comparativa · `code` ejemplos · `video` demo |
| 6.3 | Métodos estáticos y constantes | `static`, constantes globales, utility classes | `code` ejemplo `Math` custom · `text` cuándo usar static |
| 6.4 | Conjuntos de clases y librerías | Crear y usar librerías propias; organizar en paquetes | `code` mini-librería · `file` ejercicio guiado |
| 6.5 | Documentación de código | Javadoc, convenciones de documentación, README de proyecto | `code` Javadoc completo · `link` Oracle Javadoc guide |

#### Ejercicios

- **Básico:** Crear paquete `utilidades` con clase `Calculadora` de métodos estáticos
- **Intermedio:** Refactorizar la unidad anterior organizando en paquetes con visibilidad correcta
- **Consolidación:** Mini-librería de utilidades: validación de email, formateo de números, generación de IDs

#### Práctica recomendada
Refactorizar el proyecto de la Unidad 5 organizándolo en paquetes con documentación Javadoc completa.

---

### Unidad 7 — Estructuras de datos: arrays y colecciones básicas

**Descripción:** Almacenar y manipular colecciones de datos con arrays, `ArrayList`, `HashMap` e iteradores.

**RAs cubiertos:** RA6 (parcial)
**CEs cubiertos:** RA6: a, b, c, d, e, j
**Contenidos oficiales:** 6 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 7.1 | Arrays unidimensionales | Declarar, inicializar, recorrer; `length`; arrays de objetos | `code` ejemplos · `text` diagrama memoria |
| 7.2 | Arrays multidimensionales | Matrices; recorrer con bucles anidados; matrices irregulares | `code` matriz · `video` demo · `text` uso práctico |
| 7.3 | `ArrayList` y listas | Crear, añadir, eliminar, buscar; diferencia con arrays | `code` ArrayList vs array · `text` cuándo usar cada uno |
| 7.4 | `HashMap` y mapas | Clave-valor; operaciones CRUD; iteración | `code` HashMap · `text` diagrama · `video` demo |
| 7.5 | Iteradores y `for-each` | `Iterator`, `ListIterator`, `for-each`; patrón iterador | `code` ejemplos · `text` patrón iterador |

#### Ejercicios

- **Básico:** Ordenar array de números; buscar elemento; contar ocurrencias
- **Intermedio:** Agenda de contactos con `ArrayList` de objetos personalizados
- **Consolidación:** Inventario de productos con `HashMap`: buscar, actualizar, eliminar, listar

#### Práctica recomendada
Crear una mini-aplicación de gestión (agenda, inventario, lista de tareas) usando colecciones.

---

### Unidad 8 — Tipos avanzados y genéricos

**Descripción:** Genéricos, expresiones regulares, enumeraciones y operaciones agregadas sobre colecciones.

**RAs cubiertos:** RA6 (completo)
**CEs cubiertos:** RA6: a, b, c, d, e, f, g, j
**Contenidos oficiales:** 6 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 8.1 | Enumeraciones | `enum`; atributos en enums; métodos en enums | `code` ejemplo `DiaSemana` · `text` uso práctico |
| 8.2 | Genéricos | Clases genéricas; métodos genéricos; wildcards; bounds | `code` `Lista<T>` · `text` diagramas · `video` explicación |
| 8.3 | Expresiones regulares | Sintaxis regex; `Pattern`, `Matcher`; validación de strings | `code` regex · `text` tabla patrones · `link` regex101 |
| 8.4 | Operaciones agregadas | `stream()`, `filter`, `map`, `reduce`, `collect`; `Collections.sort()` | `code` streams · `text` functional interfaces |
| 8.5 | Documentos de intercambio | JSON con Jackson/Gson; CSV; serialización básica | `code` JSON parsing · `link` documentación Jackson |

#### Ejercicios

- **Básico:** Crear enum `EstadoPedido` con estados y transiciones válidas
- **Intermedio:** Clase genérica `Repositorio<T>` con operaciones CRUD
- **Consolidación:** Procesador de datos CSV: leer, filtrar, transformar y exportar usando streams

#### Práctica recomendada
Mini-proyecto: procesador de datos que lea un CSV, aplique filtros con streams y genere un JSON de salida.

---

### Unidad 9 — Herencia y polimorfismo

**Descripción:** Herencia simple, sobreescritura de métodos, jerarquías de clases y polimorfismo.

**RAs cubiertos:** RA7 (parcial)
**CEs cubiertos:** RA7: a, b, c, d, e, f, g
**Contenidos oficiales:** 7 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 9.1 | Herencia básica | `extends`, superclase/subclase, constructor `super()` | `code` jerarquía Animal · `text` diagrama UML |
| 9.2 | Sobreescritura de métodos | `@Override`; reglas; polymorfismo en tiempo de ejecución | `code` ejemplo · `video` demo · `text` reglas |
| 9.3 | Constructores en herencia | Cadena de construcción; inicialización de subclases | `code` ejemplo completo · `text` diagrama secuencia |
| 9.4 | Jerarquías de clases | Diseñar jerarquías; `instanceof`; casting | `code` jerarquía completa · `text` buenas prácticas |
| 9.5 | Polimorfismo en acción | Referencias polimórficas; colecciones de tipo padre; factory methods | `code` ejemplo completo · `video` demo · `text` diagrama |

#### Ejercicios

- **Básico:** Crear jerarquía `Vehiculo` → `Coche`, `Moto`, `Camion` con método `arrancar()`
- **Intermedio:** Sistema de empleados con tipos diferentes (`Asalariado`, `PorHoras`, `Autónomo`) y cálculo distinto de salario
- **Consolidación:** Juego simple de batalla: clase `Personaje` → `Guerrero`, `Mago`, `Arquero` con habilidades polimórficas

#### Práctica recomendada
Diseñar y implementar una jerarquía de clases con al menos 3 niveles y probar polimorfismo con colecciones.

---

### Unidad 10 — Interfaces y composición

**Descripción:** Interfaces, clases abstractas, herencia vs composición, y diseño orientado a interfaces.

**RAs cubiertos:** RA7 (completo)
**CEs cubiertos:** RA7: a, b, c, d, e, f, g, h, i, j
**Contenidos oficiales:** 7 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 10.1 | Interfaces | `interface`; implementar; métodos `default`; interfaces funcionales | `code` ejemplo · `text` diagrama UML |
| 10.2 | Clases abstractas | `abstract`; diferencias con interfaces; cuándo usar cada una | `code` comparación · `text` tabla decisiones |
| 10.3 | Herencia vs composición | Principio de composición sobre herencia; `has-a` vs `is-a` | `text` principios · `code` refactor example · `video` explicación |
| 10.4 | Documentar código avanzado | Javadoc de interfaces, herencia, paquetes; estándares de documentación | `code` proyecto documentado · `link` standards |
| 10.5 | Diseñando con interfaces | Programar contra contratos; dependency injection básico | `text` principios SOLID · `code` ejemplo · `video` demo |

#### Ejercicios

- **Básico:** Interfaz `Dibujable` con método `dibujar()`, implementada por varias formas
- **Intermedio:** Refactorizar jerarquía de la Unidad 9 usando composición donde sea más apropiado
- **Consolidación:** Sistema de notificaciones: interfaz `Notificable` con implementaciones `Email`, `SMS`, `Push`; selector dinámico

#### Práctica recomendada
Refactorizar el proyecto de la Unidad 9 aplicando interfaces y composición. Documentar con Javadoc completo.

---

### Unidad 11 — E/S avanzada: ficheros y serialización

**Descripción:** Lectura y escritura de ficheros, flujos de datos, serialización de objetos y manejo de excepciones en E/S.

**RAs cubiertos:** RA5 (completo)
**CEs cubiertos:** RA5: a, b, c, d, e, f, g, h
**Contenidos oficiales:** 5 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 11.1 | Lectura y escritura de ficheros | `FileReader`, `BufferedReader`, `FileWriter`, `BufferedWriter` | `code` ejemplos · `text` diagrama flujos |
| 11.2 | Flujos de bytes | `FileInputStream`, `FileOutputStream`, `BufferedInputStream/OutputStream` | `code` ejemplos · `text` bytes vs caracteres |
| 11.3 | Serialización de objetos | `Serializable`, `ObjectInputStream`, `ObjectOutputStream`; `transient` | `code` ejemplo completo · `text` consideraciones |
| 11.4 | Lectura/escritura estructurada | `java.nio.file`, `Path`, `Files`; try-with-resources | `code` NIO · `text` try-with-resources · `link` Java NIO tutorial |
| 11.5 | Interfaces gráficas simples | `JFrame`, `JPanel`, `JLabel`, `JButton`; LayoutManager básico | `code` ventana simple · `video` demo · `file` ejercicio guiado |

#### Ejercicios

- **Básico:** Leer un fichero de texto y contar líneas, palabras y caracteres
- **Intermedio:** Agenda que persista contactos en fichero (serialización de objetos)
- **Consolidación:** Aplicación de gestión de tareas con interfaz gráfica simple que guarde en fichero

#### Práctica recomendada
Mini-aplicación con interfaz gráfica que lea/escriba datos en fichero. Incluir serialización de objetos.

---

### Unidad 12 — Bases de datos: fundamentos y conexión

**Descripción:** Introducción a BDOO, instalación de gestor, creación de BD y conexión con Java.

**RAs cubiertos:** RA8, RA9 (parcial)
**CEs cubiertos:** RA8: a, b, c, d, e · RA9: a, b
**Contenidos oficiales:** 8 (parcial), 9 (parcial)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 12.1 | Introducción a BDOO | Características; diferencia con BD relacional; conceptos clave | `text` explicación · `video` overview · `link` documentación |
| 12.2 | Instalación de gestor | Instalar PostgreSQL; pgAdmin; primeras queries | `video` walkthrough · `text` pasos · `link` PostgreSQL download |
| 12.3 | Modelado de datos | Crear tablas; tipos de datos; claves primarias y foráneas; relaciones | `code` DDL · `text` diagrama ER · `video` demo |
| 12.4 | Conexión Java-BD | JDBC; `DriverManager`; `Connection`, `Statement`, `ResultSet` | `code` ejemplo conexión · `text` diagrama flujo · `link` Oracle JDBC tutorial |
| 12.5 | Consultas básicas | SELECT, WHERE, ORDER BY, JOIN simple; ejecutar desde Java | `code` queries · `video` demo · `text` sintaxis SQL |

#### Ejercicios

- **Básico:** Crear BD `academia` con tablas `alumno` y `curso`; insertar datos manualmente
- **Intermedio:** Programa Java que conecte a la BD y liste todos los alumnos
- **Consolidación:** Aplicación que dado un curso, muestre todos los alumnos inscritos (JOIN)

#### Práctica recomendada
Configurar entorno completo: PostgreSQL + Java + JDBC. Crear la BD del proyecto y verificar conexión.

---

### Unidad 13 — Bases de datos: CRUD y persistencia

**Descripción:** Operaciones completas de persistencia: crear, leer, actualizar, eliminar. PreparedStatements, transacciones y patrón DAO básico.

**RAs cubiertos:** RA8 (completo), RA9 (completo)
**CEs cubiertos:** RA8: a, b, c, d, e, f, g, h · RA9: a, b, c, d, e, f, g
**Contenidos oficiales:** 8 (completo), 9 (completo)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 13.1 | PreparedStatements | Evitar SQL injection; parámetros preparados; rendimiento | `code` antes/después · `text` seguridad · `video` demo |
| 13.2 | CRUD completo | Create, Read, Update, Delete desde Java; patrón básico | `code` ejemplo CRUD · `text` patrón · `video` demo |
| 13.3 | Transacciones | `commit`, `rollback`, `auto-commit`; integridad de datos | `code` ejemplo · `text` diagrama · `video` explicación |
| 13.4 | Patrón DAO | Data Access Object; separar lógica de acceso; interfaz DAO | `code` ejemplo completo · `text` principios · `video` refactor |
| 13.5 | Aplicaciones de gestión | Crear aplicación completa que gestione información de la BD | `code` mini-proyecto · `file` ejercicio guiado |

#### Ejercicios

- **Básico:** CRUD completo para tabla `alumno` usando PreparedStatements
- **Intermedio:** Implementar patrón DAO para `Alumno` y `Curso`
- **Consolidación:** Aplicación de gestión de matrículas: inscribir, consultar, modificar y cancelar inscripciones

#### Práctica recomendada
Crear aplicación completa de gestión con patrón DAO, CRUD funcional y validación de integridad.

---

### Unidad 14 — Proyecto final integrador

**Descripción:** Proyecto que integre todos los bloques temáticos del módulo. Los alumnos aplican RA1-RA9 en un caso de uso real.

**RAs cubiertos:** RA1-RA9 (todos)
**CEs cubiertos:** Todos los CEs del módulo
**Contenidos oficiales:** 1-9 (todos)

#### Lecciones propuestas

| # | Título | Objetivos | Bloques de contenido |
|---|--------|-----------|---------------------|
| 14.1 | Diseño del proyecto | Definir requisitos; modelar clases; diseñar BD | `text` guía de diseño · `file` plantilla requisitos |
| 14.2 | Implementación guiada | Desarrollo iterativo con supervisión; buenas prácticas | `video` mentoría · `code` ejemples de estructura |
| 14.3 | Pruebas y depuración | Estrategias de testing; depuración avanzada | `text` estrategias · `link` JUnit tutorial |
| 14.4 | Documentación y entrega | README, Javadoc, presentación del proyecto | `code` plantilla · `text` checklist entrega |

#### Propuesta de proyecto final

**Sistema de gestión de academia** — Aplicación de consola (o con GUI simple) que gestione:

- **Alumnos** (CRUD con persistencia en BD)
- **Cursos** (CRUD con persistencia en BD)
- **Matrículas** (relación alumno-curso, con validaciones)
- **Informes** (consultas con JOIN, estadísticas simples)
- **Ficheros** (exportar listados a CSV o serializar objetos)

**Requisitos mínimos:**
- Mínimo 4 clases con herencia o interfaces
- CRUD completo con patrón DAO
- Conexión a BD real (PostgreSQL)
- Manejo de excepciones en toda la capa de persistencia
- Documentación Javadoc completa
- Organización en paquetes

#### Ejercicios

- **Básico:** Seguir la guía para crear la estructura del proyecto
- **Intermedio:** Implementar módulo de alumnos completo
- **Consolidación:** Proyecto completo con todas las funcionalidades

#### Práctica recomendada
Desarrollo iterativo del proyecto a lo varias sesiones, con entregas parciales y retroalimentación.

---

## Matriz de cobertura

### Cobertura RA → Unidades

| RA | U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 | U11 | U12 | U13 | U14 |
|----|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:---:|:---:|:---:|:---:|
| RA1 | ✓ | ✓ | | | | | | | | | | | | ✓ |
| RA2 | ✓ | | | | ✓ | ✓ | | | | | | | | ✓ |
| RA3 | | | ✓ | ✓ | | | | | | | | | | ✓ |
| RA4 | | | | | ✓ | ✓ | | | | | | | | ✓ |
| RA5 | | ✓ | | | | | | | | | ✓ | | | ✓ |
| RA6 | | | | | | | ✓ | ✓ | | | | | | ✓ |
| RA7 | | | | | | | | | ✓ | ✓ | | | | ✓ |
| RA8 | | | | | | | | | | | | ✓ | ✓ | ✓ |
| RA9 | | | | | | | | | | | | ✓ | ✓ | ✓ |

### Cobertura Contenido Oficial → Unidades

| Contenido | U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 | U11 | U12 | U13 | U14 |
|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:---:|:---:|:---:|:---:|
| 1 — Elementos de programa | ✓ | ✓ | | | | | | | | | | | | ✓ |
| 2 — Utilización de objetos | | | | | ✓ | ✓ | | | | | | | | ✓ |
| 3 — Estructuras de control | | | ✓ | ✓ | | | | | | | | | | ✓ |
| 4 — Desarrollo de clases | | | | | ✓ | ✓ | | | | | | | | ✓ |
| 5 — E/S | | ✓ | | | | | | | | | ✓ | | | ✓ |
| 6 — Estructuras de almacenamiento | | | | | | | ✓ | ✓ | | | | | | ✓ |
| 7 — Clases avanzadas | | | | | | | | | ✓ | ✓ | | | | ✓ |
| 8 — Persistencia | | | | | | | | | | | | ✓ | ✓ | ✓ |
| 9 — Bases de datos | | | | | | | | | | | | ✓ | ✓ | ✓ |

---

## Nota sobre el lenguaje: Java

El currículo oficial (RD 405/2023) NO especifica un lenguaje de programación. Las Orientaciones Pedagógicas sí mencionan Java en ejemplos, pero no es obligatorio.

**Nuestra decisión didáctica: Java**

Razones:
1. **Alineación terminológica:** El vocabulario del currículo (clases, paquetes, herencia, `Serializable`) se mapea directamente a Java
2. **Ecosistema de FP:** Java es el lenguaje predominante en docencia de DAM/DAW en España
3. **Herramientas:** Eclipse IDE for Java Developers (gratuito) como IDE de referencia
4. **Transición a 2.º curso:** DAM usa Java en Sistemas de Gestión de Bases de Datos; DAW lo usa en Desarrollo Web en entorno servidor

**Impacto en la plataforma:**
- Los ejemplos de código están en Java
- Las referencias a librerías son del ecosistema Java
- Los ejercicios asumen JDK 17+ y Eclipse IDE
- Las prácticas incluyen configuración del entorno Java

---

## Placeholders de evaluación

> Los cuestionarios y ejercicios evaluables se implementarán cuando la plataforma soporte quizzes y ejercicios de programación.

### Estructura propuesta por unidad

| Unidad | Quiz (autoevaluación) | Ejercicio evaluado | Práctica evaluada |
|--------|:---------------------:|:------------------:|:------------------:|
| 1 | Quiz 1: Tipos y operadores | — | Configuración IDE |
| 2 | Quiz 2: E/S y formateo | Conversor temperatura | Registro de usuario |
| 3 | Quiz 3: Condicionales | Calculadora con menú | — |
| 4 | Quiz 4: Bucles y excepciones | Validación con reintento | Juego adivinanza |
| 5 | Quiz 5: POO básica | Clase `CuentaBancaria` | — |
| 6 | Quiz 6: Paquetes y visibilidad | Refactorización en paquetes | Mini-librería |
| 7 | Quiz 7: Arrays y colecciones | Agenda de contactos | — |
| 8 | Quiz 8: Genéricos y streams | Repositorio genérico | Procesador CSV |
| 9 | Quiz 9: Herencia | Jerarquía de empleados | — |
| 10 | Quiz 10: Interfaces | Sistema de notificaciones | Refactorización OO |
| 11 | Quiz 11: Ficheros | Lectura de ficheros | App con GUI + fichero |
| 12 | Quiz 12: BD y conexión | Conexión JDBC | Entorno BD completo |
| 13 | Quiz 13: CRUD y DAO | CRUD completo | App de matrículas |
| 14 | — | — | Proyecto final |

### Tipos de evaluación

| Tipo | Descripción | Plataforma |
|------|-------------|------------|
| **Quiz autoevaluación** | Preguntas múltiple opción, sin calificación | Quiz (POST-MVP) |
| **Ejercicio evaluado** | Ejercicio de código con casos de prueba | Ejercicio (POST-MVP) |
| **Práctica evaluada** | Proyecto entregable con rúbrica | File upload + rúbrica (POST-MVP) |

---

## Distribución horaria estimada

| Unidad | Horas | % del módulo |
|--------|:-----:|:------------:|
| U1 — Intro programación | 8 | 6% |
| U2 — E/S básica | 6 | 4% |
| U3 — Control: selección | 8 | 6% |
| U4 — Control: repetición + excepciones | 10 | 7% |
| U5 — POO: clases y objetos | 12 | 9% |
| U6 — Clases, visibilidad, librerías | 10 | 7% |
| U7 — Arrays y colecciones | 10 | 7% |
| U8 — Genéricos y tipos avanzados | 8 | 6% |
| U9 — Herencia y polimorfismo | 12 | 9% |
| U10 — Interfaces y composición | 10 | 7% |
| U11 — E/S avanzada: ficheros | 10 | 7% |
| U12 — BD: fundamentos y conexión | 8 | 6% |
| U13 — BD: CRUD y persistencia | 10 | 7% |
| U14 — Proyecto final | 13 | 10% |
| **Total** | **135** | **100%** |

---

## Decisiones abiertas

| # | Decisión | Estado | Notas |
|---|----------|--------|-------|
| 1 | ¿GUI Swing o JavaFX? | Abierto | Swing es más sencillo para intro; JavaFX más moderno. Ambos son válidos. |
| 2 | ¿JUnit 4 o 5? | Abierto | JUnit 5 es estándar actual; JUnit 4 aún se enseña mucho en FP |
| 3 | ¿Maven o Gradle? | Abierto | Maven más simple para primer año; Gradle más potente |
| 4 | ¿Streams en Unidad 8 o 7? | Decidido: U8 | Requiere genéricos previos |
| 5 | ¿Proyecto grupal o individual? | Abierto | Individual asegura evaluación individual; grupal simula equipo real |
| 6 | ¿MySQL o PostgreSQL? | Abierto | PostgreSQL más completo; MySQL más extendido en hosting |

---

## Documentos relacionados

- [README del directorio](./README.md) — Estructura y estado del proyecto
- [Overview del currículo](./overview.md) — Visión general de módulos
- [Fuentes oficiales](./sources.md) — Referencias normativas completas
- [Estructura del curso](../product/course-structure.md) — Modelo Course > Module > Lesson
- [Modelo de contenido](../product/lesson-content.md) — Bloques de contenido
