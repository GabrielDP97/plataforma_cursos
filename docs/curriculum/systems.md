# Blueprint — Sistemas Informáticos (0483)

## Module Header

| Campo | Valor |
|-------|-------|
| **Código** | 0483 |
| **Nombre** | Sistemas informáticos |
| **ECTS** | 10 |
| **Horas** | 100 |
| **Titulaciones** | DAM + DAW (compartido) |
| **Regulación** | RD 405/2023, ANEXO I |

> **Aviso importante:** Este módulo NO es un curso de Linux. Cubre hardware, sistemas operativos (libres y propietarios), redes, seguridad y explotación de aplicaciones de propósito general. La virtualización es una HERRAMIENTA, no el objetivo. Distinguimos explícitamente entre lo que exige el currículo y el entorno que elegimos nosotros.

---

## Resultados de Aprendizaje y Criterios de Evaluación

| RA | Descripción | CEs |
|----|-------------|-----|
| **RA1** | Evalúa sistemas informáticos, identificando sus componentes y características | 8 |
| **RA2** | Instala sistemas operativos planificando el proceso e interpretando documentación técnica | 9 |
| **RA3** | Gestiona la información del sistema identificando las estructuras de almacenamiento | 7 |
| **RA4** | Gestiona sistemas operativos utilizando comandos y herramientas gráficas | 8 |
| **RA5** | Interconecta sistemas en red configurando dispositivos y protocolos | 8 |
| **RA6** | Opera sistemas en red gestionando sus recursos e identificando restricciones de seguridad | 7 |
| **RA7** | Elabora documentación valorando y utilizando aplicaciones informáticas de propósito general | 7 |
| | **Total** | **54** |

---

## Contenidos Oficiales

1. Explotación de sistemas microinformáticos
2. Instalación de sistemas operativos
3. Gestión de la información
4. Configuración de sistemas operativos
5. Conexión de sistemas en red
6. Gestión de recursos en una red
7. Explotación de aplicaciones informáticas de propósito general

---

## Unidades Pedagógicas Propuestas

> **Nota:** Esta organización en unidades es NUESTRA propuesta didáctica. No es la secuencia oficial del currículo.

### Unidad 1 — Hardware y componentes del sistema

**Descripción:** El alumno evalúa sistemas informáticos identificando componentes (CPU, RAM, almacenamiento, periféricos) y comprende cómo interactúan. Se parte de lo tangible (el hardware) para llegar a lo abstracto (el sistema operativo).

**RAs cubiertos:** RA1  
**CEs cubiertos:** 8  
**Contenidos cubiertos:** Explotación de sistemas microinformáticos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 1.1 | Arquitectura de un sistema informático | Von Neumann, buses, CPU (ALU, registros, ciclo fetch-decode-execute), jerarquía de memoria |
| 1.2 | Componentes de un PC | Placa base, procesador, RAM (tipos), fuentes de alimentación, disipación térmica |
| 1.3 | Almacenamiento | HDD vs SSD (NVMe, SATA), tarjetas SD, USB, NAS, RAID (0, 1, 5, 10) |
| 1.4 | Periféricos y E/S | Entrada, salida, entrada-salida. Puertos (USB, HDMI, DisplayPort, Red). Controladores |
| 1.5 | Selección y evaluación | Cómo evaluar un sistema según necesidades. Presupuesto. Especificaciones técnicas: interpretar benchmarks |

**Ejercicios recomendados:**
- Identificar componentes de un PC real o virtual (foto + descripción)
- Comparar especificaciones de 3 PCs para 3 escenarios (oficina, desarrollo, gaming)
- Calcular rendimiento teórico de un disco SSD vs HDD para una tarea concreta
- Montar/desmontar virtualmente un PC (herramienta online o simulador)

---

### Unidad 2 — Instalación de sistemas operativos

**Descripción:** El alumno planifica e instala sistemas operativos, interpretando documentación técnica. Se trabaja con al menos dos entornos: uno libre (Linux) y uno propietario (Windows), para que el alumno comprenda las diferencias reales.

**RAs cubiertos:** RA2  
**CEs cubiertos:** 9  
**Contenidos cubiertos:** Instalación de sistemas operativos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 2.1 | Tipos de sistemas operativos | Monolítico, microkernel, híbrido. Escritorio vs servidor. Distribuciones Linux: Debian, Ubuntu, Fedora |
| 2.2 | Virtualización como herramienta | Hyper-V, VirtualBox, VMware. Qué es una VM. Ventajas para aprendizaje. Limitaciones de rendimiento |
| 2.3 | Planificación de la instalación | Requisitos mínimos, particionado (MBR/GPT, /boot, /, swap, NTFS), dual boot, backup previo |
| 2.4 | Instalación de Linux (Ubuntu/Debian) | Proceso de instalación paso a paso. Configuración de red, usuario, paquetes. Comparar con Windows |
| 2.5 | Post-instalación | Drivers, actualizaciones, herramientas básicas, configuración de red, verificación del sistema |

> **Nota pedagógica:** Usamos virtualización como herramienta de aprendizaje, NO como objetivo del módulo. El currículo pide "instalar sistemas operativos", no "aprender virtualización".

**Ejercicios recomendados:**
- Instalar Ubuntu Server en VM siguiendo documentación oficial
- Instalar Windows en VM y comparar proceso de instalación
- Crear snapshot antes de una configuración risky y recuperarlo
- Documentar el proceso de instalación como si fuera un técnico

---

### Unidad 3 — Gestión del sistema y de la información

**Descripción:** Gestión de archivos, permisos, estructuras de almacenamiento y administración básica del sistema operativo. Comando y herramientas gráficas.

**RAs cubiertos:** RA3, RA4  
**CEs cubiertos:** 7 + 8 = 15  
**Contenidos cubiertos:** Gestión de la información, Configuración de sistemas operativos

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 3.1 | Sistemas de archivos | NTFS, ext4, APFS, FAT32. Inodos, journaling, montaje. Comandos: `ls`, `cp`, `mv`, `rm`, `find`, `chmod`, `chown` |
| 3.2 | Gestión de usuarios y permisos | Usuarios y grupos en Linux. `useradd`, `usermod`, `passwd`. Permisos POSIX (rwx, octal). ACLs básicas |
| 3.3 | Gestión en Windows | Panel de control, PowerShell básico, administración de usuarios, permisos NTFS, políticas de grupo (introducción) |
| 3.4 | Servicios y procesos | Servicios en Linux (`systemctl`). Procesos (`ps`, `top`, `htop`). Servicios en Windows. Gestión de arranque |
| 3.5 | Mantenimiento del sistema | Actualizaciones (`apt`, `yum`, Windows Update). Logs del sistema. Copias de seguridad básicas. Monitorización |

**Ejercicios recomendados:**
- Ejercicios de permisos: resolver 10 escenarios con `chmod` y `chown`
- Gestionar usuarios en Linux: crear, asignar grupo, configurar Home
- Identificar y gestionar 5 procesos activos en Linux y Windows
- Script simple de backup en bash

---

### Unidad 4 — Conexión y configuración de redes

**Descripción:** El alumno interconecta sistemas en red, configurando dispositivos y protocolos fundamentales. Desde la teoría TCP/IP hasta la configuración práctica de interfaces de red.

**RAs cubiertos:** RA5  
**CEs cubiertos:** 8  
**Contenidos cubiertos:** Conexión de sistemas en red

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 4.1 | Fundamentos de redes | LAN, WAN, metropolitanas. Topologías (estrella, bus, anillo). Capas OSI y modelo TCP/IP |
| 4.2 | Protocolos esenciales | IP (IPv4, IPv6), TCP, UDP, HTTP, DNS, DHCP, ARP. Cuándo se usa cada uno |
| 4.3 | Configuración de red en Linux | `ip`, `nmcli`, `ifconfig` (legacy), `ping`, `traceroute`, `netstat`, `ss`. Archivos de configuración |
| 4.4 | Configuración de red en Windows | Configuración gráfica, PowerShell de red (`Get-NetAdapter`, `New-NetIPAddress`). Firewall Windows |
| 4.5 | Práctica: montar una red local | Crear red virtual entre 2 VMs. Asignar IPs estáticas. Verificar conectividad. Configurar DNS local |

**Ejercicios recomendados:**
- Ejercicio teórico: identificar capa OSI para 10 protocolos
- Configurar IP estática en Linux y Windows (VMs en misma red virtual)
- Resolver problemas de red con `ping`, `traceroute`, `nslookup`
- Montar red entre 2 VMs y transferir un archivo

---

### Unidad 5 — Gestión de recursos en red y seguridad

**Descripción:** El alumno opera sistemas en red, gestiona recursos compartidos e identifica restricciones de seguridad. Se enfatiza la concienciación安全 y las buenas prácticas.

**RAs cubiertos:** RA6  
**CEs cubiertos:** 7  
**Contenidos cubiertos:** Gestión de recursos en una red

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 5.1 | Recursos compartidos | Samba en Linux, carpetas compartidas en Windows. Permisos de red. CIFS/SMB protocol |
| 5.2 | Seguridad en sistemas | Principios CIA. Autenticación, autorización, contabilidad. Gestión de contraseñas. Cifrado básico |
| 5.3 | Firewall y segmentación | iptables/nftables (Linux), Windows Firewall. DMZ conceptual. Reglas básicas |
| 5.4 | Seguridad en red | Ataques comunes (DoS, man-in-the-middle, sniffing). VPN conceptual. HTTPS. Certificados |
| 5.5 | Práctica: servidor seguro | Configurar Samba con permisos. Configurar firewall. Auditar con herramientas básicas (`nmap` introductorio) |

**Ejercicios recomendados:**
- Compartir carpeta entre Linux y Windows con Samba
- Configurar firewall para permitir solo SSH y HTTP
- Identificar 5 vulnerabilidades en un escenario de red dado
- Ejercicio de auditar red con `nmap` (escaneo básico)

---

### Unidad 6 — Aplicaciones informáticas de propósito general

**Descripción:** El alumno elabora documentación y opera con aplicaciones informáticas de propósito general: ofimática, herramientas de presentación, hojas de cálculo y procesadores de texto.

**RAs cubiertos:** RA7  
**CEs cubiertos:** 7  
**Contenidos cubiertos:** Explotación de aplicaciones informáticas de propósito general

#### Lecciones propuestas

| # | Título | Bloques de contenido sugeridos |
|---|--------|-------------------------------|
| 6.1 | Suite ofimática | LibreOffice vs Microsoft Office. Procesador de texto, hoja de cálculo, presentaciones. Formatos: ODT, DOCX, PDF |
| 6.2 | Herramientas de documentación | Diagramas de flujo, esquemas, tablas comparativas. Uso de herramientas como Draw.io, Mermaid. Convenciones de documentación técnica |
| 6.3 | Herramientas de gestión | Gestores de tareas, calendarios, notas. Herramientas de productividad para entornos técnicos |
| 6.4 | Formatos e interoperabilidad | CSV, JSON, XML como formatos de intercambio. Exportar/importar entre herramientas. Automatización básica con macros |
| 6.5 | Práctica: documentación completa | Documentar un proceso técnico (instalación de software) usando herramientas ofimáticas y de diagramación |

**Ejercicios recomendados:**
- Crear informe técnico con tabla de contenido, imágenes y formato consistente
- Hoja de cálculo con fórmulas, gráficos y filtros para datos de inventario
- Exportar datos entre formatos (CSV → Excel → PDF)
- Crear diagrama de flujo de un proceso de instalación

---

## Matriz de Cobertura

| Contenido oficial | Unidad | RAs | CEs |
|-------------------|--------|-----|-----|
| Explotación de sistemas microinformáticos | U1 | RA1 | 8 |
| Instalación de sistemas operativos | U2 | RA2 | 9 |
| Gestión de la información | U3 | RA3 | 7 |
| Configuración de sistemas operativos | U3 | RA4 | 8 |
| Conexión de sistemas en red | U4 | RA5 | 8 |
| Gestión de recursos en una red | U5 | RA6 | 7 |
| Explotación de aplicaciones informáticas de propósito general | U6 | RA7 | 7 |
| **Total** | **6 unidades** | **7 RAs** | **54 CEs** |

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
| RA1 | Cuestionario teórico + comparativa de sistemas | 10% |
| RA2 | Práctica de instalación (informe técnico) | 15% |
| RA3 | Ejercicios de gestión de archivos y permisos | 15% |
| RA4 | Práctica de administración de SO (Linux + Windows) | 15% |
| RA5 | Práctica de configuración de red entre VMs | 15% |
| RA6 | Escenario de seguridad: configurar + auditar | 15% |
| RA7 | Documentación técnica completa de un proceso | 15% |

---

*Blueprint generado el 2026-09-17. Basado en RD 405/2023, ANEXO I.*
