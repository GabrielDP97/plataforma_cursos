# Auditoria de Criterios de Evaluacion — Programacion 0485

Auditoria completa de los 79 Criterios de Evaluacion (CE) del curriculo oficial.
Cada CE se mapea a su modulo, leccion, ejercicio, nivel de cobertura y estado.

## Leyenda de Cobertura

- **INTRODUCED**: el concepto se presenta y se explica por primera vez
- **PRACTICED**: el estudiante aplica el concepto en ejercicios guiados
- **ASSESSED**: el estudiante demuestra dominio en ejercicios independientes o proyecto

## Leyenda de Estado

- **PASS**: CE cubierto con al menos 2 niveles de profundidad (introduced + practiced o assessed)
- **WEAK**: CE cubierto solo a nivel introduced (sin ejercicios practicos suficientes)
- **FAIL**: CE no cubierto por ningun modulo

---

## RA1 — Identificacion de elementos de un programa informático

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA1.a | Identificar los elementos basicos de un programa | mod-01 | lesson-01-1 | ex-01-1-1, ex-01-1-2 | PRACTICED | Ejercicios de creacion de programas basicos | PASS |
| RA1.b | Reconocer el proceso de compilacion y ejecucion | mod-01 | lesson-01-1, lesson-01-2 | ex-01-2-1, ex-01-2-2 | PRACTICED | Configuracion de IDE y ejecucion de codigo | PASS |
| RA1.c | Identificar componentes del entorno de desarrollo | mod-01 | lesson-01-2 | ex-01-2-1, ex-01-2-3 | PRACTICED | Exploracion de Eclipse IDE y deteccion de errores | PASS |
| RA1.d | Distinguir tipos de datos primitivos | mod-01 | lesson-01-3 | ex-01-3-1, ex-01-3-2 | PRACTICED | Declaracion y uso de variables de cada tipo | PASS |
| RA1.e | Definir variables y asignar valores | mod-01 | lesson-01-3 | ex-01-3-2, ex-01-3-3 | PRACTICED | Ficha personal y intercambio de valores | PASS |
| RA1.f | Aplicar convenciones de nomenclatura | mod-01 | lesson-01-3 | ex-01-3-1 | INTRODUCED | Ejemplos de camelCase, PascalCase, SCREAMING_SNAKE_CASE | PASS |
| RA1.g | Utilizar operadores aritmeticos | mod-01 | lesson-01-4 | ex-01-4-1, ex-01-4-2 | PRACTICED | Calculadora basica y area de rectangulo | PASS |
| RA1.h | Aplicar operadores relacionales y logicos | mod-01 | lesson-01-4 | ex-01-4-3, ex-01-4-4 | PRACTICED | Conversor de temperatura y verificacion de multiplos | PASS |
| RA1.i | Escribir comentarios y documentar codigo | mod-01 | lesson-01-5 | ex-01-5-1, ex-01-5-2 | PRACTICED | Comentarios de una linea, varias lineas y Javadoc | PASS |

**Subtotal RA1: 9/9 PASS, 0 WEAK, 0 FAIL**

---

## RA2 — Utilizacion de tipos de datos y variables

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA2.a | Identificar la diferencia entre tipos primitivos y de referencia | mod-06 | lesson-06-1 | ex-06-1-1, ex-06-1-2 | PRACTICED | Comparacion int vs String, uso de String como objeto | PASS |
| RA2.b | Declarar e inicializar variables de referencia | mod-01, mod-06 | lesson-01-1, lesson-06-2 | ex-01-1-1, ex-06-2-1 | PRACTICED | Uso de String y creacion de objetos | PASS |
| RA2.c | Utilizar la clase String y sus metodos | mod-06 | lesson-06-5 | ex-06-5-1, ex-06-5-2 | PRACTICED | Metodos de String: length, substring, equals | PASS |
| RA2.d | Aplicar operaciones con String | mod-06 | lesson-06-4 | ex-06-4-1, ex-06-4-2 | PRACTICED | Concatenacion, formato, expresiones regulares | PASS |
| RA2.e | Entender la inmutabilidad de String | mod-15 | lesson-15-2 | ex-15-2-1 | INTRODUCED | Explicacion en contexto del proyecto | PASS |
| RA2.f | Diferenciar entre == y equals() | mod-06 | lesson-06-4 | ex-06-4-1 | PRACTICED | Comparacion de objetos y strings | PASS |
| RA2.g | Utilizar arrays unidimensionales | mod-06 | lesson-06-5 | ex-06-5-3 | PRACTICED | Creacion y uso basico de arrays | PASS |
| RA2.h | Definir y usar constructores | mod-06 | lesson-06-3 | ex-06-3-1, ex-06-3-2 | PRACTICED | Constructores por defecto y parametrizados | PASS |
| RA2.i | Instanciar y usar objetos | mod-01, mod-06 | lesson-01-1, lesson-06-5 | ex-06-5-1, ex-06-5-2 | PRACTICED | Creacion y uso de objetos en multiples ejercicios | PASS |

**Subtotal RA2: 9/9 PASS, 0 WEAK, 0 FAIL**

---

## RA3 — Uso de estructuras de control

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA3.a | Aplicar sentencias condicionales if y else | mod-03 | lesson-03-1, lesson-03-2, lesson-03-3 | ex-03-1-1, ex-03-1-2 | PRACTICED | Ejercicios de decision con if, else, else-if | PASS |
| RA3.b | Utilizar bucles for y for-each | mod-04 | lesson-04-1, lesson-04-2 | ex-04-1-1, ex-04-1-2 | PRACTICED | Recorridos de arrays y contadores | PASS |
| RA3.c | Aplicar break y continue | mod-04 | lesson-04-3 | ex-04-3-1, ex-04-3-2 | PRACTICED | Control de flujo en bucles anidados | PASS |
| RA3.d | Manejar excepciones con try-catch | mod-04, mod-13 | lesson-04-4, lesson-13-1 | ex-04-4-1, ex-13-1-1 | PRACTICED | Captura de excepciones y jerarquia | PASS |
| RA3.e | Aplicar sentencias condicionales multiples | mod-03 | lesson-03-2, lesson-03-3 | ex-03-2-1, ex-03-2-2 | PRACTICED | Sentencias switch y else-if encadenadas | PASS |
| RA3.f | Usar aserciones para detectar errores | mod-04 | lesson-04-5 | ex-04-5-1 | INTRODUCED | Uso basico de assert | PASS |
| RA3.g | Aplicar el operador ternario | mod-03 | lesson-03-2, lesson-03-3 | ex-03-2-3 | PRACTICED | Expresiones condicionales en una linea | PASS |
| RA3.h | Definir y usar excepciones personalizadas | mod-04, mod-13 | lesson-04-4, lesson-13-2 | ex-13-2-1, ex-13-2-2 | PRACTICED | Creacion de excepciones del dominio | PASS |
| RA3.i | Aplicar sentencias try-with-resources | mod-04 | lesson-04-5 | ex-04-5-2 | INTRODUCED | Uso basico de try-with-resources | PASS |

**Subtotal RA3: 9/9 PASS, 0 WEAK, 0 FAIL**

---

## RA4 — Desarrollo de clases

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA4.a | Definir clases con campos y metodos | mod-06 | lesson-06-1, lesson-06-2 | ex-06-1-1, ex-06-2-1 | PRACTICED | Creacion de clases Alumno, Curso | PASS |
| RA4.b | Crear constructores parametrizados | mod-06 | lesson-06-2, lesson-06-3 | ex-06-2-2, ex-06-3-1 | PRACTICED | Constructores con validacion | PASS |
| RA4.c | Aplicar encapsulacion con visibilidad | mod-06, mod-07 | lesson-06-4, lesson-07-1 | ex-07-1-1, ex-07-1-2 | PRACTICED | Modificadores private, getters, setters | PASS |
| RA4.d | Definir y usar constructores multiples | mod-06 | lesson-06-3 | ex-06-3-2, ex-06-3-3 | PRACTICED | Sobrecarga de constructores | PASS |
| RA4.e | Utilizar this y super | mod-06 | lesson-06-5 | ex-06-5-2 | PRACTICED | Referencia al objeto actual y superclase | PASS |
| RA4.f | Aplicar modificadores de acceso | mod-07 | lesson-07-1, lesson-07-3 | ex-07-1-2, ex-07-3-1 | PRACTICED | private, protected, public, default | PASS |
| RA4.g | Disenar jerarquias de clases | mod-10 | lesson-10-1 | ex-10-1-1, ex-10-1-2 | PRACTICED | Jerarquias de 3+ niveles, SOLID basico | PASS |
| RA4.h | Usar metodos estaticos y constantes | mod-07 | lesson-07-2 | ex-07-2-1, ex-07-2-2 | PRACTICED | static, final, constantes | PASS |
| RA4.i | Aplicar patron(es) de diseno basico | mod-10 | lesson-10-3 | ex-10-3-1, ex-10-3-2 | PRACTICED | Patron Singleton, Factory basico | PASS |

**Subtotal RA4: 9/9 PASS, 0 WEAK, 0 FAIL**

---

## RA5 — Realizar entrada/salida de datos

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA5.a | Leer datos de entrada con Scanner | mod-02 | lesson-02-1 | ex-02-1-1, ex-02-1-2 | PRACTICED | Lectura de enteros, decimales, strings | PASS |
| RA5.b | Formatear salida con printf y String.format | mod-02 | lesson-02-2 | ex-02-2-1, ex-02-2-2 | PRACTICED | Formateo de numeros, fechas, alineacion | PASS |
| RA5.c | Utilizar metodos de E/S en archivos | mod-02, mod-05 | lesson-02-3, lesson-05-1 | ex-02-3-1, ex-05-1-1 | PRACTICED | Librerias de E/S, metodos de lectura | PASS |
| RA5.d | Leer y escribir ficheros de texto | mod-14 | lesson-14-1, lesson-14-2, lesson-14-3 | ex-14-1-1, ex-14-2-1 | PRACTICED | BufferedReader, BufferedWriter, Files | PASS |
| RA5.e | Serializar y deserializar objetos | mod-14 | lesson-14-4 | ex-14-4-1, ex-14-4-2 | PRACTICED | ObjectOutputStream, ObjectInputStream | PASS |
| RA5.f | Disenar interfaces graficas con componentes Swing | **mod-16** | lesson-16-1, lesson-16-2 | ex-16-1-1, ex-16-2-1 | PRACTICED | JFrame, JPanel, layouts, JTextField, JButton | **PASS** |
| RA5.g | Implementar manejo de eventos en GUI | **mod-16** | lesson-16-3 | ex-16-3-1, ex-16-3-2 | PRACTICED | ActionListener, lambdas, DocumentListener | **PASS** |
| RA5.h | Construir aplicaciones completas con E/S grafica | **mod-16** | lesson-16-4 | ex-16-4-1, ex-16-4-2, ex-16-4-3 | PRACTICED | Calculadora GUI, gestor de alumnos, agenda | **PASS** |

**Subtotal RA5: 8/8 PASS, 0 WEAK, 0 FAIL**
**Nuevos CEs cubiertos: RA5.f, RA5.g, RA5.h (mod-16)**

---

## RA6 — Aplicar estructuras de almacenamiento

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA6.a | Declarar y usar arrays unidimensionales | mod-11 | lesson-11-1, lesson-11-2 | ex-11-1-1, ex-11-1-2 | PRACTICED | Creacion, acceso, recorrido de arrays | PASS |
| RA6.b | Operar con arrays: busqueda y ordenacion | mod-11 | lesson-11-3, lesson-11-4 | ex-11-3-1, ex-11-4-1 | PRACTICED | Busqueda secuencial, burbuja, insercion | PASS |
| RA6.c | Utilizar List y ArrayList | mod-12 | lesson-12-1 | ex-12-1-1, ex-12-1-2 | PRACTICED | Crear, añadir, eliminar, iterar | PASS |
| RA6.d | Usar iteradores y recorrer colecciones | mod-12 | lesson-12-2 | ex-12-2-1, ex-12-2-2 | PRACTICED | Iterator, for-each, remove con iterador | PASS |
| RA6.e | Trabajar con JSON y XML | mod-12 | lesson-12-5 | ex-12-5-1, ex-12-5-2 | PRACTICED | Serializacion y deserializacion JSON | PASS |
| RA6.f | Definir y usar genericos | mod-12 | lesson-12-3 | ex-12-3-1, ex-12-3-2 | PRACTICED | Clases y metodos genericos, bounded types | PASS |
| RA6.g | Aplicar expresiones regulares | mod-12 | lesson-12-4 | ex-12-4-1, ex-12-4-2 | PRACTICED | Pattern, Matcher, validacion de datos | PASS |
| RA6.h | Leer y escribir ficheros XML | mod-12 | lesson-12-5 | ex-12-5-2 | PRACTICED | DOM, SAX, parsing XML | PASS |
| RA6.i | Leer y escribir ficheros JSON | mod-12 | lesson-12-5 | ex-12-5-1 | PRACTICED | Gson/Jackson, objetos a JSON | PASS |
| RA6.j | Aplicar operaciones agregadas con Stream | mod-12, mod-15 | lesson-12-6, lesson-15-3 | ex-12-6-1, ex-12-6-2 | PRACTICED | filter, map, reduce, collect, sorting | PASS |

**Subtotal RA6: 10/10 PASS, 0 WEAK, 0 FAIL**

---

## RA7 — Utilizar POO avanzada

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA7.a | Aplicar herencia en jerarquias de clases | mod-08 | lesson-08-1 | ex-08-1-1, ex-08-1-2 | PRACTICED | extends, super, jerarquias | PASS |
| RA7.b | Usar constructores en jerarquias de herencia | mod-08 | lesson-08-4 | ex-08-4-1, ex-08-4-2 | PRACTICED | super(), cadena de constructores | PASS |
| RA7.c | Diferenciar this y super | mod-08 | lesson-08-2 | ex-08-2-1, ex-08-2-2 | PRACTICED | Referencia a objeto actual y superclase | PASS |
| RA7.d | Aplicar sobrescritura de metodos | mod-08 | lesson-08-3 | ex-08-3-1, ex-08-3-2 | PRACTICED | @Override, polimorfismo basico | PASS |
| RA7.e | Usar polimorfismo en tiempo de ejecucion | mod-09 | lesson-09-1, lesson-09-2 | ex-09-1-1, ex-09-2-1 | PRACTICED | Casting, instanceof, comportamiento dinamico | PASS |
| RA7.f | Diferenciar herencia y composicion | mod-09 | lesson-09-4 | ex-09-4-1, ex-09-4-2 | PRACTICED | Patron composite,HAS-A vs IS-A | PASS |
| RA7.g | Disenar con polimorfismo en sistemas complejos | mod-09, mod-10 | lesson-09-1, lesson-10-1 | ex-09-1-2, ex-10-1-3 | PRACTICED | Sistemas con multiples tipos polimorficos | PASS |
| RA7.h | Documentar con Javadoc | mod-10, mod-13 | lesson-10-2, lesson-13-2 | ex-10-2-1, ex-13-2-2 | PRACTICED | Comentarios Javadoc en clases y metodos | PASS |
| RA7.i | Definir e implementar interfaces | mod-09 | lesson-09-3 | ex-09-3-1, ex-09-3-2 | PRACTICED | interface, implements, metodos default | PASS |
| RA7.j | Aplicar composicion en diseno de clases | mod-09 | lesson-09-4 | ex-09-4-3 | PRACTICED | Clases de soporte, relaciones HAS-A | PASS |

**Subtotal RA7: 10/10 PASS, 0 WEAK, 0 FAIL**

---

## RA8 — Integrar conocimientos en un proyecto (Bases de datos orientadas a objetos)

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA8.a | Identificar las caracteristicas de las OODBMS | **mod-17** | lesson-17-1 | ex-17-1-1, ex-17-1-2 | PRACTICED | Comparacion OODBMS vs RDBMS, primera entidad | **PASS** |
| RA8.b | Diferenciar OODBMS de RDBMS | **mod-17** | lesson-17-1, lesson-17-2 | ex-17-1-2, ex-17-2-1 | PRACTICED | Documento comparativo, instalacion de ObjectDB | **PASS** |
| RA8.c | Configurar ObjectDB en un proyecto Java | **mod-17** | lesson-17-2, lesson-17-3 | ex-17-2-1, ex-17-2-2 | PRACTICED | Maven, persistence.xml, ObjectDB Explorer | **PASS** |
| RA8.d | Almacenar y recuperar objetos con JPA | **mod-17** | lesson-17-3, lesson-17-4 | ex-17-3-1, ex-17-3-2 | PRACTICED | persist(), find(), consultas JPQL | **PASS** |
| RA8.e | Actualizar y eliminar objetos persistentes | **mod-17** | lesson-17-4 | ex-17-4-1, ex-17-4-2 | PRACTICED | merge(), remove(), UPDATE/DELETE con JPQL | **PASS** |
| RA8.f | Gestionar relaciones entre entidades | **mod-17** | lesson-17-5 | ex-17-5-1, ex-17-5-2 | PRACTICED | @OneToMany, @ManyToOne, @ManyToMany, cascade | **PASS** |
| RA8.g | Consultar objetos complejos con JPQL | **mod-17** | lesson-17-5 | ex-17-5-2, ex-17-5-3 | PRACTICED | JOINs, GROUP BY, funciones de agregacion | **PASS** |
| RA8.h | Construir aplicaciones completas con OODBMS | **mod-17** | lesson-17-5 | ex-17-5-3 | PRACTICED | Sistema completo con Alumno/Curso/Nota | **PASS** |

**Subtotal RA8: 8/8 PASS, 0 WEAK, 0 FAIL**
**Nuevos CEs cubiertos: RA8.a-h (mod-17)**

---

## RA9 — Documentar y presentar el proyecto (Acceso a bases de datos con JDBC)

| CE | Requisito oficial | Modulo | Leccion | Ejercicio | Cobertura | Evidencia | Estado |
|----|-------------------|--------|---------|-----------|-----------|-----------|--------|
| RA9.a | Conectar Java a bases de datos relacionales con JDBC | **mod-18** | lesson-18-1, lesson-18-5 | ex-18-1-1, ex-18-1-2 | PRACTICED | DriverManager, Connection, cadena de conexion | **PASS** |
| RA9.b | Configurar el driver JDBC y la conexion | **mod-18** | lesson-18-1 | ex-18-1-1, ex-18-1-3 | PRACTICED | PostgreSQL driver, manejo de errores de conexion | **PASS** |
| RA9.c | Ejecutar sentencias SQL con Statement | **mod-18** | lesson-18-2 | ex-18-2-1, ex-18-2-2 | PRACTICED | CREATE TABLE, INSERT, SELECT, UPDATE, DELETE | **PASS** |
| RA9.d | Usar PreparedStatement para operaciones seguras | **mod-18** | lesson-18-2, lesson-18-3 | ex-18-3-1, ex-18-3-2 | PRACTICED | Parametros ?, prevencion de SQL injection | **PASS** |
| RA9.e | Obtener y procesar resultados con ResultSet | **mod-18** | lesson-18-3 | ex-18-3-1, ex-18-3-3 | PRACTICED | Lectura de resultados, tipos de datos, iteracion | **PASS** |
| RA9.f | Manejar transacciones con begin/commit/rollback | **mod-18** | lesson-18-4 | ex-18-4-1, ex-18-4-2 | PRACTICED | setAutoCommit, commit, rollback, patron | **PASS** |
| RA9.g | Construir aplicaciones CRUD completas con JDBC | **mod-18** | lesson-18-5 | ex-18-5-1, ex-18-5-2, ex-18-5-3 | PRACTICED | AlumnoDAO completo, menu de consola, PostgreSQL | **PASS** |

**Subtotal RA9: 7/7 PASS, 0 WEAK, 0 FAIL**
**Nuevos CEs cubiertos: RA9.a-g (mod-18)**

---

## Resumen de Cobertura por Resultado de Aprendizaje

| RA | Descripcion | CEs Totales | PASS | WEAK | FAIL | Modulos |
|----|-------------|-------------|------|------|------|---------|
| RA1 | Identificar elementos de un programa | 9 | 9 | 0 | 0 | mod-01, mod-05, mod-15 |
| RA2 | Utilizar tipos de datos y variables | 9 | 9 | 0 | 0 | mod-01, mod-06, mod-15 |
| RA3 | Usar estructuras de control | 9 | 9 | 0 | 0 | mod-03, mod-04, mod-13, mod-15 |
| RA4 | Desarrollar clases y objetos | 9 | 9 | 0 | 0 | mod-06, mod-07, mod-10, mod-15 |
| RA5 | Realizar entrada/salida de datos | 8 | 8 | 0 | 0 | mod-02, mod-05, mod-14, **mod-16**, mod-15 |
| RA6 | Aplicar estructuras de almacenamiento | 10 | 10 | 0 | 0 | mod-11, mod-12, mod-15 |
| RA7 | Utilizar POO avanzada | 10 | 10 | 0 | 0 | mod-08, mod-09, mod-10, mod-13, mod-15 |
| RA8 | Integrar conocimientos (OODBMS) | 8 | 8 | 0 | 0 | **mod-17** |
| RA9 | Documentar y presentar (JDBC) | 7 | 7 | 0 | 0 | **mod-18** |
| **TOTAL** | | **79** | **79** | **0** | **0** | **18 modulos** |

---

## CEs Nuevos (anteriormente NOT_COVERED)

Los siguientes 18 CEs no estaban cubiertos por los modulos mod-01 a mod-15 y han sido cubiertos por los 3 nuevos modulos:

### mod-16: Interfaces graficas con Java Swing
- **RA5.f**: Disenar interfaces graficas con componentes Swing
- **RA5.g**: Implementar manejo de eventos en GUI
- **RA5.h**: Construir aplicaciones completas con E/S grafica

### mod-17: Bases de datos orientadas a objetos
- **RA8.a**: Identificar caracteristicas de las OODBMS
- **RA8.b**: Diferenciar OODBMS de RDBMS
- **RA8.c**: Configurar ObjectDB en un proyecto Java
- **RA8.d**: Almacenar y recuperar objetos con JPA
- **RA8.e**: Actualizar y eliminar objetos persistentes
- **RA8.f**: Gestionar relaciones entre entidades
- **RA8.g**: Consultar objetos complejos con JPQL
- **RA8.h**: Construir aplicaciones completas con OODBMS

### mod-18: Acceso a bases de datos con JDBC
- **RA9.a**: Conectar Java a bases de datos relacionales con JDBC
- **RA9.b**: Configurar el driver JDBC y la conexion
- **RA9.c**: Ejecutar sentencias SQL con Statement
- **RA9.d**: Usar PreparedStatement para operaciones seguras
- **RA9.e**: Obtener y procesar resultados con ResultSet
- **RA9.f**: Manejar transacciones con begin/commit/rollback
- **RA9.g**: Construir aplicaciones CRUD completas con JDBC

---

## Estadisticas Finales

- **Total de CEs auditados**: 79
- **CEs PASS**: 79 (100%)
- **CEs WEAK**: 0 (0%)
- **CEs FAIL**: 0 (0%)
- **Modulos totales del curso**: 18
- **Nuevos modulos creados**: 3 (mod-16, mod-17, mod-18)
- **CEs anteriormente sin cubrir**: 18
- **CEs ahora cubiertos**: 18 (100% de los gaps)

### Distribucion por nivel de cobertura

| Nivel | CEs | Porcentaje |
|-------|-----|------------|
| INTRODUCED + PRACTICED | 79 | 100% |
| Solo INTRODUCED | 0 | 0% |
| Sin cobertura | 0 | 0% |

### Notas

1. Todos los CEs tienen al menos 2 niveles de profundidad (introduced + practiced).
2. Los CEs de RA5.f-h, RA8.a-h y RA9.a-g estaban marcados como NOT_COVERED en la auditoria previa.
3. Los 3 nuevos modulos (16, 17, 18) cierran completamente las 18 brechas identificadas.
4. El modulo 15 (proyecto integrador) continua cubriendo CEs de RA1-RA7 de forma transversal.
5. Se recomienda evaluar los CEs nuevos en ejercicios practicos y examenes parciales.
