# ObjectDB — Licencia y Versión

## Versión Utilizada

**ObjectDB 2.9.5** (lanzada 2 de marzo de 2026)

- Última versión estable
- Soporte para JPA 3.2 (Jakarta Persistence)
- Compatible con Java 21
- Disponible en Maven: `com.objectdb:objectdb:2.9.5`

## Licencia

ObjectDB es software **propietario/comercial** (License Agreement v2.0.4).

### Edición Gratuita

| Límite | Valor |
|--------|-------|
| Máximo de clases entidad | 10 (entidades + embeddables combinados) |
| Máximo de entidades por archivo | 1.000.000 |
| Uso comercial | Permitido dentro de los límites |
| Modo servidor | Permitido (con riesgos de seguridad — ver abajo) |

### Licencia Educativa

- Disponible gratuitamente para profesores e investigadores en instituciones de educación superior
- Proceso: abrir ticket de soporte en https://www.objectdb.com/forum
- Elimina los límites de 10 clases y 1M de entidades

### Restricciones de Redistribución

**⚠️ NO se puede redistribuir ObjectDB.**

> "The Customer is not allowed to make copies of the Software or distribute the Software or any portion of it, except under an OEM license"

- ❌ NO se puede incluir el JAR de ObjectDB en materiales del curso
- ❌ NO se puede alojar en nuestros servidores para descarga
- ✅ SÍ se puede enlazar a la página oficial de descarga
- ✅ SÍ se puede instructar a los alumnos para que descarguen desde objectdb.com
- ✅ SÍ se pueden usar dependencias Maven/Gradle (descargadas del repositorio oficial)

## Cómo Obtenerlo los Alumnos

### Opción 1: Maven
```xml
<dependency>
    <groupId>com.objectdb</groupId>
    <artifactId>objectdb</artifactId>
    <version>2.9.5</version>
</dependency>
```

### Opción 2: Descarga directa
https://www.objectdb.com/download

### Opción 3: Repositorio Maven de ObjectDB
```xml
<repository>
    <id>objectdb</id>
    <name>ObjectDB Repository</name>
    <url>https://m2.objectdb.com</url>
</repository>
```

## ⚠️ Aviso de Seguridad

**Vulnerabilidad RCE crítica divulgada (18 de agosto de 2026)** en ObjectDB 2.9.5 en modo servidor:
- Credenciales por defecto `admin/admin` conceden privilegios completos sin cambio forzado
- La evaluación de filtros JDOQL permite invocación reflectiva de métodos estáticos arbitrarios
- Permite Remote Code Execution (RCE) pre-autenticación como root

**Recomendación para el curso:** Los alumnos deben ser advertidos de **nunca** ejecutar ObjectDB en modo servidor en máquinas accesibles públicamente. El modo embebido (basado en ficheros) es más seguro para aprendizaje.

## Uso en el Curso

ObjectDB se utiliza para trabajar el concepto curricular de:

**Base de datos orientada a objetos**

NO se presenta como:
- "La base de datos que debes usar profesionalmente"
- "El sustituto de PostgreSQL/MySQL"

Se separa claramente:
- **Aprendizaje curricular**: entender qué es una BDOO y cómo persistir objetos
- **Recomendación tecnológica profesional**: PostgreSQL/MySQL son las opciones estándar en la industria

## Fuentes

- ObjectDB Official: https://www.objectdb.com/
- ObjectDB License: https://www.objectdb.com/license
- ObjectDB Download: https://www.objectdb.com/download
- ObjectDB Maven: https://m2.objectdb.com/
