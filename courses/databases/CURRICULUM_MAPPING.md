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

### RA4: Modificar datos, transacciones y concurrencia (COMPLETE — M12 + M13)

| Contenido | Módulo | Lección |
|---|---|---|
| DML: INSERT, UPDATE, DELETE | mod-12 | lesson-12-1 |
| INSERT: insertar una fila | mod-12 | lesson-12-2 |
| INSERT múltiple y valores por defecto | mod-12 | lesson-12-3 |
| INSERT ... SELECT | mod-12 | lesson-12-4 |
| UPDATE: modificar información | mod-12 | lesson-12-5 |
| UPDATE con condiciones y expresiones | mod-12 | lesson-12-6 |
| DELETE: eliminar información | mod-12 | lesson-12-7 |
| DELETE vs TRUNCATE vs DROP | mod-12 | lesson-12-7 |
| Integridad y errores al modificar datos | mod-12 | lesson-12-8 |
| Claves foráneas y acciones referenciales | mod-12 | lesson-12-9 |
| Subconsultas en INSERT, UPDATE y DELETE | mod-12 | lesson-12-10 |
| Modificaciones seguras y depuración | mod-12 | lesson-12-11 |
| Caso práctico completo | mod-12 | lesson-12-12 |
| Qué es una transacción | mod-13 | lesson-13-1 |
| Propiedades ACID | mod-13 | lesson-13-2 |
| Autocommit y control manual | mod-13 | lesson-13-3 |
| START TRANSACTION, COMMIT, ROLLBACK | mod-13 | lesson-13-4 |
| DDL y commits implícitos en MySQL | mod-13 | lesson-13-5 |
| SAVEPOINT y reversión parcial | mod-13 | lesson-13-6 |
| Concurrência: múltiples usuarios | mod-13 | lesson-13-7 |
| Problemas de concurrencia (dirty read, non-repeatable, phantom, lost update) | mod-13 | lesson-13-8 |
| Niveles de aislamiento | mod-13 | lesson-13-9 |
| Bloqueos y SELECT ... FOR UPDATE | mod-13 | lesson-13-10 |
| Deadlocks | mod-13 | lesson-13-11 |
| Diseño de transacciones seguras y caso práctico | mod-13 | lesson-13-12 |

### RA5: Procedimientos almacenados y automatización (COMPLETE — M14 + M15)

| Contenido | Módulo | Lección |
|---|---|---|
| Introducción a programación almacenada | mod-14 | lesson-14-1 |
| Bloques BEGIN...END y DELIMITER | mod-14 | lesson-14-2 |
| Variables locales y asignación | mod-14 | lesson-14-3 |
| SELECT ... INTO | mod-14 | lesson-14-4 |
| Condicionales con IF | mod-14 | lesson-14-5 |
| Condicionales con CASE | mod-14 | lesson-14-6 |
| Bucles WHILE | mod-14 | lesson-14-7 |
| REPEAT, LOOP, LEAVE, ITERATE | mod-14 | lesson-14-8 |
| Procedimientos almacenados (IN, OUT, INOUT) | mod-14 | lesson-14-9 a lesson-14-11 |
| Funciones almacenadas | mod-14 | lesson-14-12 |
| Procedimientos vs funciones y buenas prácticas | mod-14 | lesson-14-13 |
| Caso práctico completo | mod-14 | lesson-14-14 |
| Triggers: introducción y CREATE TRIGGER | mod-15 | lesson-15-1 |
| BEFORE y AFTER | mod-15 | lesson-15-2 |
| NEW y OLD | mod-15 | lesson-15-3 |
| Triggers de INSERT | mod-15 | lesson-15-4 |
| Triggers de UPDATE | mod-15 | lesson-15-5 |
| Triggers de DELETE | mod-15 | lesson-15-6 |
| Auditoría y automatización con triggers | mod-15 | lesson-15-7 |
| Triggers vs constraints y limitaciones | mod-15 | lesson-15-8 |
| Cursores: introducción | mod-15 | lesson-15-9 |
| DECLARE, OPEN, FETCH, CLOSE | mod-15 | lesson-15-10 |
| Cursores con NOT FOUND y handlers | mod-15 | lesson-15-11 |
| Tratamiento de errores con handlers | mod-15 | lesson-15-12 |
| SIGNAL, RESIGNAL y errores personalizados | mod-15 | lesson-15-13 |
| Buenas prácticas y caso práctico | mod-15 | lesson-15-14 |

### RA6: Diseñar modelo relacional normalizado y diagramas E/R

| Contenido | Módulo | Lección |
|---|---|---|
| Diseño E/R completo | mod-03 | lesson-03-1 a lesson-03-5 |
| Transformación E/R a relacional | mod-04 | lesson-04-1 a lesson-04-5 |
| Normalización completa (1NF, 2NF, 3NF) | mod-05 | lesson-05-1 a lesson-05-5 |
| Vistas: conceptos y ventajas | mod-07 | lesson-07-1 |
| Crear y gestionar vistas | mod-07 | lesson-07-2 |
| Índices y rendimiento | mod-07 | lesson-07-3 |
| Crear y gestionar índices | mod-07 | lesson-07-4 |
| Usuarios y autenticación | mod-07 | lesson-07-5 |
| Privilegios, GRANT y REVOKE | mod-07 | lesson-07-6 |
| Seguridad y mínimo privilegio | mod-07 | lesson-07-7 |
| Caso práctico y repaso | mod-07 | lesson-07-8 |
| Proyecto final: diseño completo | mod-17 | lesson-17-1 a lesson-17-3 |

### RA7: Bases de datos no relacionales (COMPLETE — M16)

| Contenido | Módulo | Lección |
|---|---|---|
| Introducción a bases de datos no relacionales | mod-16 | lesson-16-1 |
| Tipos NoSQL: documental, clave-valor, columnar, grafo | mod-16 | lesson-16-2 |
| Bases documentales y MongoDB | mod-16 | lesson-16-3 |
| Preparación del entorno MongoDB | mod-16 | lesson-16-4 |
| Documentos, colecciones y BSON | mod-16 | lesson-16-5 |
| Insertar y consultar documentos | mod-16 | lesson-16-6 |
| Filtros, operadores y proyecciones | mod-16 | lesson-16-7 |
| Actualizar y eliminar documentos | mod-16 | lesson-16-8 |
| Diseñar documentos: embebido vs referencias | mod-16 | lesson-16-9 |
| Índices en MongoDB | mod-16 | lesson-16-10 |
| Aggregation Pipeline | mod-16 | lesson-16-11 |
| Validación y calidad de los datos | mod-16 | lesson-16-12 |
| Escalabilidad, replicación y sharding | mod-16 | lesson-16-13 |
| Caso práctico y comparación SQL vs NoSQL | mod-16 | lesson-16-14 |

---

## Estadísticas del curso

| Métrica | Cantidad |
|---|---|
| Módulos | 17 |
| Lecciones totales | 194 |
| Bloques de contenido | ~759 |
| Ejercicios | ~409 |
| RA cubiertos | 7/7 (100%) |

## Cobertura por módulo

| Módulo | Lecciones | Bloques aprox. | Ejercicios |
|---|---|---|---|
| mod-01: Introducción | 12 | 38 | 12 |
| mod-02: Entorno | 12 | 39 | 12 |
| mod-03: Modelo E/R | 12 | 64 | 12 |
| mod-04: E/R a Relacional | 12 | 39 | 12 |
| mod-05: Normalización | 12 | 27 | 12 |
| mod-06: Creación SQL | 12 | 42 | 12 |
| mod-07: Vistas, índices, usuarios | 8 | 27 | 14 |
| mod-08: Consultas básicas | 8 | 20 | 8 |
| mod-09: Funciones y resumen | 8 | 22 | 8 |
| mod-10: Consultas multitabla | 8 | 24 | 8 |
| mod-11: Subconsultas | 8 | 36 | 29 |
| mod-12: Modificación datos | 12 | 56 | 43 |
| mod-13: Transacciones y concurrencia | 12 | 57 | 41 |
| mod-14: Programación almacenada | 14 | 63 | 50 |
| mod-15: Triggers, cursores y excepciones | 14 | 65 | 51 |
| mod-16: Bases de datos no relacionales | 14 | 64 | 48 |
| mod-17: Proyecto final | 16 | 76 | 23 |
| **TOTAL** | **194** | **~759** | **~409** |

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
| mod-12: Modificación datos | ✅ Implementado (12 lecciones, 43 ejercicios) |
| mod-13: Transacciones y concurrencia | ✅ Implementado (12 lecciones, 41 ejercicios) |
| mod-14: Programación almacenada | ✅ Implementado (14 lecciones, 50 ejercicios) |
| mod-15: Triggers, cursores y excepciones | ✅ Implementado (14 lecciones, 51 ejercicios) |
| mod-16: Bases de datos no relacionales | ✅ Implementado (14 lecciones, 48 ejercicios) |
| mod-17: Proyecto final | ✅ Implementado (16 lecciones, 23 checkpoints) |
