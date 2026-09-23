# Curriculum Mapping — Bases de datos (0484)

## Mapeo oficial RA1-RA7

### RA1: Reconocer elementos de bases de datos, tipos de SGBD e introducción a Big Data

| Contenido | Módulo | Lección |
|---|---|---|
| Qué es una base de datos | mod-01 | lesson-01-1 |
| Componentes fundamentales de una BD | mod-01 | lesson-01-1 |
| Ficheros vs bases de datos | mod-01 | lesson-01-2 |
| Evolución del almacenamiento de datos | mod-01 | lesson-01-2 |
| Tipos de bases de datos (jerárquica, red, relacional, OO, NoSQL) | mod-01 | lesson-01-3 |
| SGBD: definición y funciones principales | mod-01 | lesson-01-4 |
| Principales SGBD del mercado | mod-01 | lesson-01-4 |
| MySQL en detalle | mod-01 | lesson-01-4 |
| Arquitectura de un SGBD (3 niveles ANSI/SPARC) | mod-01 | lesson-01-5 |
| Arquitectura cliente-servidor | mod-01 | lesson-01-5 |
| Clasificación de los SGBD (relacionales, NoSQL, otros) | mod-01 | lesson-01-6 |
| Sistemas centralizados vs distribuidos | mod-01 | lesson-01-7 |
| Replicación y partición | mod-01 | lesson-01-7 |
| Teorema CAP | mod-01 | lesson-01-7 |
| Fragmentación horizontal y vertical | mod-01 | lesson-01-8 |
| Criterios de fragmentación | mod-01 | lesson-01-8 |
| Protección de datos (RGPD) | mod-01 | lesson-01-9 |
| Derechos del usuario (RGPD) | mod-01 | lesson-01-9 |
| Medidas de protección en BD | mod-01 | lesson-01-9 |
| Big Data (5 V) | mod-01 | lesson-01-10 |
| Herramientas de Big Data | mod-01 | lesson-01-10 |
| Business Intelligence (BI) | mod-01 | lesson-01-11 |
| Proceso ETL | mod-01 | lesson-01-11 |
| Herramientas de BI | mod-01 | lesson-01-11 |

### RA2: Crear bases de datos y definir estructura relacional

| Contenido | Módulo | Lección |
|---|---|---|
| Instalación de MySQL Server | mod-02 | lesson-02-1 |
| MySQL Workbench: instalación y uso | mod-02 | lesson-02-2 |
| Conexiones al servidor | mod-02 | lesson-02-2 |
| Crear servidores y bases de datos | mod-02 | lesson-02-3 |
| Ejecución de scripts SQL | mod-02 | lesson-02-4 |
| Base de datos de ejemplo del curso | mod-02 | lesson-02-5 |
| Modelo E/R: entidades y atributos | mod-03 | lesson-03-1 |
| Modelo E/R: relaciones y cardinalidades | mod-03 | lesson-03-2 |
| Participación y restricciones | mod-03 | lesson-03-3 |
| Entidades débiles | mod-03 | lesson-03-4 |
| Modelo E/R extendido (herencia) | mod-03 | lesson-03-5 |
| Transformación E/R a tablas | mod-04 | lesson-04-1 |
| Transformación relaciones 1:1 | mod-04 | lesson-04-2 |
| Transformación relaciones 1:N | mod-04 | lesson-04-3 |
| Transformación relaciones N:M | mod-04 | lesson-04-4 |
| Entidades débiles en modelo relacional | mod-04 | lesson-04-5 |
| Integridad del modelo relacional | mod-04 | lesson-04-5 |
| Normalización: problemas de diseño | mod-05 | lesson-05-1 |
| Dependencias funcionales | mod-05 | lesson-05-2 |
| 1NF | mod-05 | lesson-05-3 |
| 2NF | mod-05 | lesson-05-4 |
| 3NF | mod-05 | lesson-05-5 |

### RA3: Consultar datos con SQL de manipulación

| Contenido | Módulo | Lección |
|---|---|---|
| SELECT básico, columnas, alias | mod-08 | lesson-08-1 |
| DISTINCT | mod-08 | lesson-08-2 |
| WHERE y operadores de comparación | mod-08 | lesson-08-2 |
| NULL, BETWEEN, IN, LIKE | mod-08 | lesson-08-3 |
| ORDER BY | mod-08 | lesson-08-4 |
| LIMIT y paginación | mod-08 | lesson-08-4 |
| Funciones numéricas | mod-09 | lesson-09-1 |
| Funciones de cadena | mod-09 | lesson-09-2 |
| Funciones de fecha | mod-09 | lesson-09-2 |
| Funciones de agregación (COUNT, SUM, AVG, MIN, MAX) | mod-09 | lesson-09-3 |
| GROUP BY | mod-09 | lesson-09-3 |
| HAVING | mod-09 | lesson-09-3 |
| INNER JOIN | mod-10 | lesson-10-1 |
| LEFT JOIN y RIGHT JOIN | mod-10 | lesson-10-2 |
| Múltiples JOINs | mod-10 | lesson-10-3 |
| Errores comunes en JOINs | mod-10 | lesson-10-3 |
| Subconsultas escalares | mod-11 | lesson-11-1 |
| Subconsultas con IN | mod-11 | lesson-11-1 |
| Subconsultas correlacionadas | mod-11 | lesson-11-1 |
| EXISTS, ANY, ALL | mod-11 | lesson-11-2 |
| UNION | mod-11 | lesson-11-2 |
| EXPLAIN y optimización | mod-11 | lesson-11-3 |

### RA4: Modificar datos, transacciones y concurrencia

| Contenido | Módulo | Lección |
|---|---|---|
| INSERT individual y múltiple | mod-12 | lesson-12-1 |
| INSERT SELECT | mod-12 | lesson-12-1 |
| UPDATE simple y con JOIN | mod-12 | lesson-12-2 |
| DELETE y TRUNCATE | mod-12 | lesson-12-2 |
| Propiedades ACID | mod-13 | lesson-13-1 |
| COMMIT, ROLLBACK, SAVEPOINT | mod-13 | lesson-13-2 |
| Problemas de concurrencia | mod-13 | lesson-13-3 |
| Niveles de aislamiento | mod-13 | lesson-13-3 |
| Bloqueos en MySQL | mod-13 | lesson-13-3 |

### RA5: Procedimientos almacenados y automatización

| Contenido | Módulo | Lección |
|---|---|---|
| Variables en MySQL | mod-14 | lesson-14-1 |
| Funciones del SGBD | mod-14 | lesson-14-1 |
| Estructuras de control (IF, CASE, WHILE, LOOP) | mod-14 | lesson-14-2 |
| Procedimientos almacenados (IN, OUT, INOUT) | mod-14 | lesson-14-3 |
| Funciones de usuario | mod-14 | lesson-14-4 |
| Triggers (BEFORE/AFTER) | mod-15 | lesson-15-1 |
| NEW y OLD en triggers | mod-15 | lesson-15-1 |
| Cursores | mod-15 | lesson-15-2 |
| DECLARE HANDLER (excepciones) | mod-15 | lesson-15-2 |

### RA6: Diseñar modelo relacional normalizado y diagramas E/R

| Contenido | Módulo | Lección |
|---|---|---|
| Diseño E/R completo | mod-03 | lesson-03-1 a lesson-03-5 |
| Transformación E/R a relacional | mod-04 | lesson-04-1 a lesson-04-5 |
| Normalización completa (1NF, 2NF, 3NF) | mod-05 | lesson-05-1 a lesson-05-5 |
| Índices para optimización | mod-07 | lesson-07-1 |
| Vistas | mod-07 | lesson-07-2 |
| Seguridad (usuarios y privilegios) | mod-07 | lesson-07-3 |
| Proyecto final: diseño completo | mod-17 | lesson-17-1 a lesson-17-3 |

### RA7: Bases de datos no relacionales

| Contenido | Módulo | Lección |
|---|---|---|
| Conceptos NoSQL | mod-16 | lesson-16-1 |
| Tipos: documental, clave-valor, columnar, grafo | mod-16 | lesson-16-1 |
| Introducción práctica a MongoDB | mod-16 | lesson-16-2 |
| CRUD en MongoDB | mod-16 | lesson-16-2 |

---

## Estadísticas del curso

| Métrica | Cantidad |
|---|---|
| Módulos | 17 |
| Lecciones totales | 70 |
| Bloques de contenido | ~250 |
| Ejercicios | ~50 |
| RA cubiertos | 7/7 (100%) |

## Cobertura por módulo

| Módulo | Lecciones | Bloques aprox. | Ejercicios |
|---|---|---|---|
| mod-01: Introducción | 12 | 36 | 12 |
| mod-02: Entorno | 5 | 15 | 3 |
| mod-03: Modelo E/R | 5 | 15 | 3 |
| mod-04: E/R a Relacional | 5 | 15 | 3 |
| mod-05: Normalización | 5 | 15 | 3 |
| mod-06: Creación SQL | 4 | 12 | 3 |
| mod-07: Estructura y seguridad | 3 | 9 | 2 |
| mod-08: Consultas básicas | 4 | 12 | 3 |
| mod-09: Funciones y resumen | 3 | 9 | 3 |
| mod-10: Consultas multitabla | 3 | 9 | 2 |
| mod-11: Subconsultas | 3 | 9 | 2 |
| mod-12: Modificación datos | 2 | 6 | 2 |
| mod-13: Transacciones | 3 | 9 | 2 |
| mod-14: Programación almacenada | 4 | 12 | 3 |
| mod-15: Triggers/cursores | 2 | 6 | 2 |
| mod-16: NoSQL | 2 | 6 | 2 |
| mod-17: Proyecto final | 3 | 9 | 3 |
| **TOTAL** | **70** | **~204** | **~50** |

## Bases de datos de ejemplo utilizadas

1. **academia**: Alumnos, profesores, asignaturas, matrículas, notas (módulos 1-15)
2. **tienda**: Clientes, productos, pedidos, categorías (módulos 6-12)
3. **plataforma_cursos**: Usuarios, cursos, módulos, lecciones, matrículas, progreso (módulo 17)
4. **MongoDB academia**: Versión NoSQL de la BD academia (módulo 16)

## Estado de implementación

| Módulo | Estado |
|---|---|
| mod-01: Introducción | ✅ Implementado (12 lecciones) |
| mod-02: Entorno | ⏳ Pendiente |
| mod-03: Modelo E/R | ⏳ Pendiente |
| mod-04: E/R a Relacional | ⏳ Pendiente |
| mod-05: Normalización | ⏳ Pendiente |
| mod-06: Creación SQL | ⏳ Pendiente |
| mod-07: Estructura y seguridad | ⏳ Pendiente |
| mod-08: Consultas básicas | ⏳ Pendiente |
| mod-09: Funciones y resumen | ⏳ Pendiente |
| mod-10: Consultas multitabla | ⏳ Pendiente |
| mod-11: Subconsultas | ⏳ Pendiente |
| mod-12: Modificación datos | ⏳ Pendiente |
| mod-13: Transacciones | ⏳ Pendiente |
| mod-14: Programación almacenada | ⏳ Pendiente |
| mod-15: Triggers/cursores | ⏳ Pendiente |
| mod-16: NoSQL | ⏳ Pendiente |
| mod-17: Proyecto final | ⏳ Pendiente |
