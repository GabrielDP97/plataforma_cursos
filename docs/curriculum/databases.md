# Blueprint — Bases de Datos (0484)

## Module Header

| Campo | Valor |
|-------|-------|
| **Código** | 0484 |
| **Nombre** | Bases de datos |
| **ECTS** | 12 |
| **Horas** | 105 |
| **Titulaciones** | DAM + DAW (compartido) |
| **Regulación** | RD 405/2023, ANEXO I |

---

## Resultados de Aprendizaje y Criterios de Evaluación

| RA | Descripción | CEs |
|----|-------------|-----|
| **RA1** | Reconoce los elementos de las bases de datos analizando sus funciones y valorando la utilidad de los sistemas gestores | 10 |
| **RA2** | Crea bases de datos definiendo su estructura y las características de sus elementos según el modelo relacional | 8 |
| **RA3** | Consulta la información almacenada en una base de datos empleando asistentes, herramientas gráficas y el lenguaje de manipulación de datos | 8 |
| **RA4** | Modifica la información almacenada en la base de datos utilizando asistentes, herramientas gráficas y el lenguaje de manipulación de datos | 8 |
| **RA5** | Desarrolla procedimientos almacenados evaluando y utilizando las sentencias del lenguaje incorporado en el sistema gestor de bases de datos | 10 |
| **RA6** | Diseña modelos relacionales normalizados interpretando diagramas entidad/relación | 8 |
| **RA7** | Gestiona la información almacenada en bases de datos no relacionales | 5 |
| | **Total** | **57** |

---

## Contenidos Oficiales

1. Almacenamiento de la información
2. Bases de datos relacionales
3. Realización de consultas
4. Tratamiento de datos
5. Programación de bases de datos
6. Interpretación de Diagramas E/R
7. Uso de bases de datos no relacionales

---

## Unidades Pedagógicas Propuestas

> **Nota:** Esta organización en unidades es NUESTRA propuesta didáctica. No es la secuencia oficial del currículo.

### Unidad 1 — Fundamentos de bases de datos y almacenamiento

**Descripción:** Introducción al concepto de base de datos, sistemas gestores (SGBD), modelos de datos y formas de almacenar la información. El alumno comprende POR QUÉ existen las bases de datos y qué problemas resuelven.

**RAs cubiertos:** RA1  
**CEs cubiertos:** 10  
**Contenidos cubiertos:** Almacenamiento de la información

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 1.1 | ¿Qué es una base de datos? | Definición, ventajas frente a ficheros planos, tipos de SGBD (relacionales vs NoSQL), arquitectura cliente-servidor |
| 1.2 | Modelos de datos | Modelo jerárquico, modelo en red, modelo relacional, modelo orientado a objetos. Evolución histórica |
| 1.3 | Elementos de un SGBD | Tablas, campos, registros, claves, integridad referencial, metadatos, diccionario de datos |
| 1.4 | Sistemas gestores comparados | MySQL, PostgreSQL, Oracle, SQL Server, MongoDB. Licencias, características, casos de uso |
| 1.5 | Almacenamiento lógico y físico | Estructuras de almacenamiento: páginas, extents, índices B-tree. Cómo el SGBD gestiona el disco |

**Ejercicios recomendados:**
- Comparar fichero Excel vs tabla de base de datos: qué pierdes con Excel
- Identificar elementos en un SGBD instalado (tablas, claves, relaciones)
- Instalación guiada de MySQL/PostgreSQL en entorno local
- Consultar el diccionario de datos de una BD de ejemplo

---

### Unidad 2 — Diseño relacional y normalización

**Descripción:** El alumno aprende a diseñar bases de datos relacionales partiendo de requisitos, interpretando diagramas E/R y aplicando normalización. Es la base teórica que sustenta TODO lo demás.

**RAs cubiertos:** RA2, RA6  
**CEs cubiertos:** 8 + 8 = 16  
**Contenidos cubiertos:** Bases de datos relacionales, Interpretación de Diagramas E/R

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 2.1 | El modelo relacional | Relaciones, atributos, dominios, claves (primaria,候选, externa), integridad实体, integridad referencial |
| 2.2 | Diagramas Entidad-Relación | Entidades, atributos, relaciones (cardinalidad), entidades débiles, herencia. Notación Chench y Crow's Foot |
| 2.3 | De requisitos a diagrama E/R | Proceso: identificar entidades → atributos → relaciones → cardinalidades. Ejercicio completo con caso práctico |
| 2.4 | Normalización | Formas normales (1FN, 2FN, 3FN, BCNF). Dependencias funcionales. Proceso de normalización paso a paso |
| 2.5 | Creación de bases de datos | `CREATE DATABASE`, `CREATE TABLE`, tipos de datos, `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT` |

**Ejercicios recomendados:**
- Diseñar diagrama E/R para una biblioteca (caso guiado)
- Normalizar un esquema con redundancias hasta 3FN
- Crear una BD relacional completa con `CREATE TABLE` en MySQL/PostgreSQL
- Convertir diagrama E/R a esquema relacional y verificar con datos de prueba

---

### Unidad 3 — Consultas SQL (SELECT)

**Descripción:** Manipulación de datos en lectura. Desde selección simple hasta joins complejos y subconsultas. El alumno debe dominar SQL como herramienta de consulta antes de pasar a modificación.

**RAs cubiertos:** RA3  
**CEs cubiertos:** 8  
**Contenidos cubiertos:** Realización de consultas

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 3.1 | Consultas básicas | `SELECT`, `FROM`, `WHERE`, operadores de comparación, `LIKE`, `IN`, `BETWEEN`, `ORDER BY` |
| 3.2 | Funciones y agrupaciones | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, `HAVING` |
| 3.3 | Consultas multi-tabla (JOINs) | `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`, `CROSS JOIN`. Alias de tabla y columna |
| 3.4 | Subconsultas | Subconsultas en `WHERE`, en `FROM`, en `SELECT`. `EXISTS`, `NOT EXISTS`, subconsultas correlacionadas |
| 3.5 | Consultas avanzadas | `UNION`, `INTERSECT`, `EXCEPT`, vistas, consultas con fechas, expresiones condicionales (`CASE`) |

**Ejercicios recomendados:**
- 15 consultas progresivas sobre una BD de tienda online (guiadas)
- Resolver problemas reales: "¿Cuántos pedidos por cliente?", "Productos sin vender"
- Comparar rendimiento de subconsulta vs JOIN
- Crear vistas para consultas frecuentes

---

### Unidad 4 — Modificación de datos (INSERT, UPDATE, DELETE)

**Descripción:** El alumno aprende a insertar, actualizar y eliminar registros. Se enfatiza la integridad referencial y las transacciones como mecanismo de protección.

**RAs cubiertos:** RA4  
**CEs cubiertos:** 8  
**Contenidos cubiertos:** Tratamiento de datos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 4.1 | Inserción de datos | `INSERT INTO`, inserción múltiple, inserción selectiva, manejo de `NULL`, valores por defecto |
| 4.2 | Actualización y borrado | `UPDATE ... SET ... WHERE`, `DELETE FROM ... WHERE`. Peligro de sentencias sin `WHERE` |
| 4.3 | Transacciones | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`. ACID. Aislamiento de transacciones |
| 4.4 | Restricciones y disparadores | `CHECK`, `ON DELETE CASCADE`, `ON UPDATE RESTRICT`. Integridad declarativa vs programada |
| 4.5 | Práctica integral | Caso completo: crear BD → insertar datos → hacer consultas → modificar → verificar integridad |

**Ejercicios recomendados:**
- Insertar registros con y sin restricciones de integridad (observar errores)
- Simular transferencia bancaria con transacciones ( Commit / Rollback)
- Crear escenario de borrado en cascada y observar efectos
- Práctica final: operaciones CRUD completas sobre BD de ejemplo

---

### Unidad 5 — Programación de bases de datos

**Descripción:** Procedimientos almacenados, funciones, triggers y cursores. El alumno programa lógica dentro del SGBD usando el lenguaje procedimental del motor (PL/pgSQL o MySQL procedural).

**RAs cubiertos:** RA5  
**CEs cubiertos:** 10  
**Contenidos cubiertos:** Programación de bases de datos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 5.1 | Introducción a procedimientos almacenados | `CREATE PROCEDURE`, parámetros de entrada/salida, ejecución con `CALL`, beneficios de la lógica en el servidor |
| 5.2 | Funciones definidas por el usuario | `CREATE FUNCTION`, retorno de valores, diferencias con procedimientos, uso en consultas |
| 5.3 | Cursores y flujo de control | `DECLARE CURSOR`, `OPEN`, `FETCH`, `CLOSE`. `IF/ELSE`, `CASE`, bucles `WHILE`/`FOR` |
| 5.4 | Triggers | `CREATE TRIGGER`, eventos (`BEFORE`/`AFTER`), `NEW`/`OLD`. Casos de uso: auditoría, validación |
| 5.5 | Práctica: sistema de auditoría | Crear trigger que registre cambios en tabla de empleados. Procedimiento que genere reportes. Función que calcule estadísticas |

**Ejercicios recomendados:**
- Crear procedimiento para registrar un pedido completo (varias tablas)
- Función que devuelva el total de ventas de un cliente en un periodo
- Trigger de auditoría que registre INSERT/UPDATE/DELETE con usuario y timestamp
- Resolver un caso real con procedimientos + triggers + funciones combinados

---

### Unidad 6 — Bases de datos NoSQL

**Descripción:** Introducción a bases de datos no relacionales. El alumno comprende cuándo y por qué usar NoSQL, y opera con al menos un tipo (documental, clave-valor o columnar).

**RAs cubiertos:** RA7  
**CEs cubiertos:** 5  
**Contenidos cubiertos:** Uso de bases de datos no relacionales

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 6.1 | ¿Por qué NoSQL? | Limitaciones del modelo relacional, casos de uso NoSQL, tipos (documental, clave-valor, columnar, grafo), CAP theorem |
| 6.2 | MongoDB: fundamentos | Colecciones, documentos BSON, `insertOne`, `find`, `updateOne`, `deleteOne`. Comparación conceptual con SQL |
| 6.3 | MongoDB: consultas avanzadas | Operadores de consulta (`$gt`, `$in`, `$regex`), proyección, ordenación, agregación (`$group`, `$match`, `$project`) |
| 6.4 | Modelado NoSQL vs relacional | Cuándo denormalizar, patrones de diseño, repliación de datos, consistencia eventual |
| 6.5 | Integración relacional + NoSQL | Caso híbrido: SQL para datos transaccionales, MongoDB para logs/sesiones. Conectores y drivers |

**Ejercicios recomendados:**
- Migrar un esquema relacional simple a documento MongoDB
- Consultas en MongoDB equivalentes a JOINs en SQL
- Decidir: ¿SQL o NoSQL? para 5 escenarios reales (justificar)
- Mini-proyecto:组合 relational BD + MongoDB para una aplicación de cursos

---

## Matriz de Cobertura

| Contenido oficial | Unidad | RAs | CEs |
|-------------------|--------|-----|-----|
| Almacenamiento de la información | U1 | RA1 | 10 |
| Bases de datos relacionales | U2 | RA2 | 8 |
| Interpretación de Diagramas E/R | U2 | RA6 | 8 |
| Realización de consultas | U3 | RA3 | 8 |
| Tratamiento de datos | U4 | RA4 | 8 |
| Programación de bases de datos | U5 | RA5 | 10 |
| Uso de bases de datos no relacionales | U6 | RA7 | 5 |
| **Total** | **6 unidades** | **7 RAs** | **57 CEs** |

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
| RA1 | Cuestionario teórico + practica SGBD | 10% |
| RA2 | Diseño E/R + creación de BD | 15% |
| RA3 | Práctica de consultas SQL | 15% |
| RA4 | Práctica de modificación + transacciones | 15% |
| RA5 | Proyecto de procedimientos almacenados | 20% |
| RA6 | Ejercicio de normalización + diagrama E/R | 15% |
| RA7 | Ejercicio práctico MongoDB/NoSQL | 10% |

---

*Blueprint generado el 2026-09-17. Basado en RD 405/2023, ANEXO I.*
