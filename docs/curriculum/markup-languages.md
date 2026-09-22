# Blueprint — Lenguajes de Marcas y Sistemas de Gestión de Información (0373)

## Module Header

| Campo | Valor |
|-------|-------|
| **Código** | 0373 |
| **Nombre** | Lenguajes de marcas y sistemas de gestión de información |
| **ECTS** | 7 |
| **Horas** | 70 |
| **Titulaciones** | DAM + DAW (compartido) |
| **Regulación** | RD 405/2023, ANEXO I |

> **Aviso importante:** Este módulo NO es un curso de desarrollo web. Cubre lenguajes de marcas (HTML, CSS, XML), lenguajes de script de cliente (JavaScript para DOM), esquemas de validación, transformación de documentos, almacenamiento de información y sistemas de gestión empresarial. El foco es la TRANSMISIÓN Y GESTIÓN DE INFORMACIÓN, no la creación de sitios web.

---

## Resultados de Aprendizaje y Criterios de Evaluación

| RA | Descripción | CEs |
|----|-------------|-----|
| **RA1** | Reconoce las características de lenguajes de marcas analizando e interpretando fragmentos de código | 9 |
| **RA2** | Utiliza lenguajes de marcas para la transmisión y presentación de información a través de la web | 10 |
| **RA3** | Accede y manipula documentos web utilizando lenguajes de script de cliente | 6 |
| **RA4** | Establece mecanismos de validación de documentos para el intercambio de información | 7 |
| **RA5** | Realiza conversiones sobre documentos para el intercambio de información | 7 |
| **RA6** | Gestiona la información en formatos de intercambio de datos analizando y utilizando tecnologías de almacenamiento y lenguajes de consulta | 9 |
| **RA7** | Opera sistemas empresariales de gestión de información realizando tareas de importación, integración, aseguramiento y extracción | 9 |
| | **Total** | **57** |

---

## Contenidos Oficiales

1. Reconocimiento de lenguajes de marcas
2. Utilización en entornos web
3. Manipulación de documentos Web
4. Definición de esquemas y vocabularios
5. Conversión y adaptación de documentos
6. Almacenamiento de información
7. Sistemas de gestión empresarial

---

## Unidades Pedagógicas Propuestas

> **Nota:** Esta organización en unidades es NUESTRA propuesta didáctica. No es la secuencia oficial del currículo.

### Unidad 1 — Fundamentos de lenguajes de marcas

**Descripción:** Introducción al concepto de lenguajes de marcas: qué son, cómo funcionan, por qué existen. Se contrasta con lenguajes de programación. El alumno reconoce la estructura de HTML, XML y CSS.

**RAs cubiertos:** RA1  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Reconocimiento de lenguajes de marcas

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 1.1 | ¿Qué es un lenguaje de marcas? | Diferencia entre marcas y programación. Intención semántica. Historia: SGML → XML → HTML |
| 1.2 | Anatomía de HTML | Etiquetas, atributos, elementos,DOCTYPE, estructura básica. Elementos block vs inline |
| 1.3 | Anatomía de XML | Sintaxis estricta. Etiquetas definidas por el usuario. Documentos bien formados. Ejemplos de uso real |
| 1.4 | CSS: presentación separada | Selectores, propiedades, valores. Cascada y especificidad. Hojas de estilo externas, internas, inline |
| 1.5 | JSON como alternativa | Sintaxis JSON. JSON vs XML: ventajas y desventajes. Uso en APIs y configuración |

**Ejercicios recomendados:**
- Analizar 5 fragmentos de HTML/XML: identificar etiquetas, atributos, errores de sintaxis
- Convertir una descripción en texto plano a XML bien formado
- Escribir HTML válido con estructura semántica (header, nav, main, footer)
- Crear JSON que represente los mismos datos que un XML dado

---

### Unidad 2 — HTML y CSS para transmisión de información

**Descripción:** El alumno utiliza HTML y CSS para presentar información en la web. No se pretende formar desarrolladores web, sino que comprendan cómo la web transmite información y puedan crear páginas básicas con contenido estructurado.

**RAs cubiertos:** RA2  
**CEs cubiertos:** 10  
**Contenidos cubiertos:** Utilización en entornos web

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 2.1 | HTML semántico | Etiquetas semánticas (`<article>`, `<section>`, `<nav>`, `<aside>`, `<table>`, `<form>`). Accesibilidad básica |
| 2.2 | Formularios HTML | Tipos de input, validación HTML5, `<label>`, `<fieldset>`, `<select>`, `<textarea>` |
| 2.3 | CSS: maquetación | Box model, display (block, inline, flex), position, unidades (rem, em, %, vh/vw) |
| 2.4 | CSS: diseño responsive | Media queries, enfoque mobile-first, imágenes responsive, fuentes web |
| 2.5 | Práctica: página de información | Crear página web con contenido estructurado, formulario y diseño responsive. Foco en CONTENIDO, no en estética |

**Ejercicios recomendados:**
- Crear página de documentación técnica con HTML semántico
- Diseñar formulario de contacto con validación HTML5
- Aplicar estilos CSS a una página dada para hacerla responsive
- Analizar 3 páginas web: identificar estructura HTML y reglas CSS

---

### Unidad 3 — Manipulación de documentos con JavaScript de cliente

**Descripción:** El alumno accede y manipula documentos web usando JavaScript en el navegador. El foco es DOM manipulation, no programación general. Se usa JavaScript como herramienta de interacción con documentos, no como lenguaje de desarrollo completo.

**RAs cubiertos:** RA3  
**CEs cubiertos:** 6  
**Contenidos cubiertos:** Manipulación de documentos Web

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 3.1 | JavaScript en el navegador | `<script>`, consola del navegador, tipos de datos, variables, operadores. Diferencia con JavaScript del lado del servidor |
| 3.2 | Manipulación del DOM | `document.getElementById()`, `querySelector()`, `innerHTML`, `textContent`, `setAttribute()` |
| 3.3 | Eventos | `addEventListener()`, eventos comunes (click, submit, input, load). Propagación de eventos |
| 3.4 | Validación con JavaScript | Validación de formularios en cliente, expresiones regulares básicas, feedback al usuario |
| 3.5 | Práctica: formulario interactivo | Formulario con validación en tiempo real, cambios dinámicos en el DOM, retroalimentación visual |

**Ejercicios recomendados:**
- Manipular el DOM para mostrar/ocultar contenido según interacción del usuario
- Validar formulario con JavaScript: nombre, email, contraseña
- Crear contador interactivo que modifique el DOM
- Modificar dinámicamente estilos CSS desde JavaScript

---

### Unidad 4 — Validación y esquemas de documentos

**Descripción:** El alumno establece mecanismos de validación de documentos XML mediante DTD y XML Schema. Comprende la importancia de los vocabularios controlados para el intercambio de información.

**RAs cubiertos:** RA4  
**CEs cubiertos:** 7  
**Contenidos cubiertos:** Definición de esquemas y vocabularios

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 4.1 | ¿Por qué validar? | Documentos bien formados vs válidos. Validación como contrato. Casos de uso: intercambio entre sistemas |
| 4.2 | DTD (Document Type Definition) | Declaraciones de elementos, atributos, entidades. Referencia en XML. Limitaciones de DTD |
| 4.3 | XML Schema (XSD) | Estructura de un XSD. Tipos simples y complejos. Restricciones. Namespaces en Schema |
| 4.4 | Namespaces XML | Prefijos, URIs, resolución de conflictos. Namespaces en XML y en XSD |
| 4.5 | Práctica: definir vocabulario | Crear XSD para un vocabulario de cursos. Validar XML contra el schema. Depurar errores de validación |

**Ejercicios recomendados:**
- Crear DTD para documento XML de inventario
- Convertir DTD a XSD manteniendo las mismas restricciones
- Identificar y corregir 5 errores de validación en un XML
- Diseñar XSD completo para un catálogo de productos

---

### Unidad 5 — Transformación de documentos

**Descripción:** El alumno realiza conversiones sobre documentos para el intercambio de información. XSLT como herramienta de transformación, y alternativas modernas.

**RAs cubiertos:** RA5  
**CEs cubiertos:** 7  
**Contenidos cubiertos:** Conversión y adaptación de documentos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 5.1 | Introducción a XSLT | XSLT como lenguaje de transformación. XPath como lenguaje de selección. Proceso: XML → XSLT → resultado |
| 5.2 | XSLT básico | Plantillas, `<xsl:for-each>`, `<xsl:value-of>`, `<xsl:if>`, `<xsl:choose>`. Generar HTML desde XML |
| 5.3 | XSLT avanzado | Ordenación, agrupación, llamadas a plantillas, parámetros. Transformaciones complejas |
| 5.4 | XPath | Expresiones XPath: nodos, atributos, funciones de cadena, fecha, números. Selectores avanzados |
| 5.5 | Alternativas a XSLT | JSON → HTML (plantillas JS), Markdown → HTML, conversión entre formatos con herramientas modernas |

**Ejercicios recomendados:**
- Transformar XML de cursos a tabla HTML con XSLT
- Generar PDF (vía HTML intermedio) desde XML con datos de alumnos
- Crear 3 transformaciones XPath sobre un documento XML dado
- Comparar XSLT con alternativas modernas para el mismo resultado

---

### Unidad 6 — Almacenamiento y consulta de información

**Descripción:** El alumno gestiona información en formatos de intercambio de datos, analiza tecnologías de almacenamiento y utiliza lenguajes de consulta sobre documentos XML.

**RAs cubiertos:** RA6  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Almacenamiento de información

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 6.1 | Formatos de intercambio de datos | XML, JSON, CSV, YAML. Cuándo usar cada uno. Ventajas y limitaciones. Conversión entre formatos |
| 6.2 | Bases de datos XML | BaseX, eXist-db, SQL Server XML. Almacenar XML en bases de datos relacionales (columnas XML) |
| 6.3 | XQuery | Sintaxis básica de XQuery. FLWOR expressions. Consultas sobre documentos XML. Comparación con SQL |
| 6.4 | JSON y almacenamiento | JSON en bases de datos (PostgreSQL JSONB, MongoDB). JSON Schema para validación. JSONPath |
| 6.5 | Práctica: pipeline de datos | Crear pipeline: XML → validación → transformación → almacenamiento → consulta. Caso real: catálogo de productos |

**Ejercicios recomendados:**
- Convertir entre XML, JSON y CSV para el mismo conjunto de datos
- Almacenar documento XML en BaseX y consultarlo con XQuery
- Consultar JSON con JSONPath para extraer datos anidados
- Diseñar pipeline completo de intercambio de datos

---

### Unidad 7 — Sistemas de gestión empresarial

**Descripción:** El alumno opera sistemas empresariales de gestión de información: tareas de importación, integración, aseguramiento y extracción de datos. Se comprende el papel de los lenguajes de marcas en entornos empresariales.

**RAs cubiertos:** RA7  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Sistemas de gestión empresarial

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 7.1 | ERP y sistemas empresariales | Qué es un ERP. SAP, Odoo, ERPNext. Flujo de información en una empresa. Integración de datos |
| 7.2 | Importación de datos | Formatos de importación. ETL (Extract, Transform, Load). Herramientas de importación masiva |
| 7.3 | Integración de sistemas | Web services, APIs REST, SOAP. Intercambio de datos entre sistemas. SOAP vs REST |
| 7.4 | Aseguramiento de calidad de datos | Limpieza de datos, deduplicación, validación. Reglas de negocio. Auditoría de datos |
| 7.5 | Extracción de reportes | Generación de informes. Exportación a diferentes formatos. Dashboards básicos. KPIs |

**Ejercicios recomendados:**
- Importar datos CSV a base de datos y verificar integridad
- Simular integración entre dos sistemas usando XML como formato intermedio
- Limpiar dataset con problemas (duplicados, formatos inconsistentes)
- Generar informe exportando datos de una base a XML/JSON/CSV

---

## Matriz de Cobertura

| Contenido oficial | Unidad | RAs | CEs |
|-------------------|--------|-----|-----|
| Reconocimiento de lenguajes de marcas | U1 | RA1 | 9 |
| Utilización en entornos web | U2 | RA2 | 10 |
| Manipulación de documentos Web | U3 | RA3 | 6 |
| Definición de esquemas y vocabularios | U4 | RA4 | 7 |
| Conversión y adaptación de documentos | U5 | RA5 | 7 |
| Almacenamiento de información | U6 | RA6 | 9 |
| Sistemas de gestión empresarial | U7 | RA7 | 9 |
| **Total** | **7 unidades** | **7 RAs** | **57 CEs** |

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
| RA1 | Cuestionario de reconocimiento de lenguajes + ejercicios de código | 10% |
| RA2 | Práctica: página web con HTML/CSS | 15% |
| RA3 | Práctica: formulario interactivo con JavaScript | 10% |
| RA4 | Ejercicio: crear XSD y validar XML | 12% |
| RA5 | Ejercicio: transformación XSLT | 12% |
| RA6 | Práctica: pipeline de datos con XQuery | 18% |
| RA7 | Caso práctico: operar sistema de gestión empresarial | 23% |

---

*Blueprint generado el 2026-09-17. Basado en RD 405/2023, ANEXO I.*
