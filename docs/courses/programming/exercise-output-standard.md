# Estándar de Salida Esperada para Ejercicios de Código

> **Fecha**: 2026-09-20
> **Alcance**: Todos los ejercicios de código del curso de Programación
> **Componente**: `ExerciseShell.tsx` — campo `expectedOutput`

---

## Definición

Todo ejercicio de código que produce una **salida observable y determinista** debe incluir un campo `expectedOutput` que muestre la salida exacta que la solución del ejercicio debe producir.

## ¿Cuándo aplicar?

| Tipo de ejercicio | ¿Requiere `expectedOutput`? | Razón |
|-------------------|------------------------------|-------|
| Solo `System.out.println` con valores hardcodeados | **SÍ** | La salida es siempre la misma |
| Usa `Scanner` / entrada del usuario | **NO** | La salida depende de la entrada |
| Usa `System.getProperty()` o entorno variable | **NO** | La salida varía según el sistema |
| Ejercicio de depuración / corrección de código | **NO** | No hay una salida "correcta" única |
| Ejercicio de documentación / comentarios | **NO** | El objetivo es el código, no la salida |
| Cálculos con valores hardcodeados | **SÍ** | La salida es siempre la misma |

## Formato en el JSON

El campo `expectedOutput` es un string con la salida exacta, incluyendo saltos de línea:

```json
{
  "id": "ex-01-1-1",
  "difficulty": "basic",
  "title": "Hola mundo personalizado",
  "description": "Crea un programa Java que imprima tu nombre...",
  "expectedOutput": "Mi nombre es Maria Garcia Lopez",
  "solution": "public class HolaNombre { ... }"
}
```

## Formato en la interfaz

Cuando `expectedOutput` existe, ExerciseShell muestra una sección visualmente distinta:

```
+--------------------------------------------------+
| FORMATO DE SALIDA ESPERADO                       |
|                                                  |
| +----------------------------------------------+ |
| | [contenido exacto en monospace]              | |
| +----------------------------------------------+ |
|                                                  |
| Tu solución debe producir EXACTAMENTE esta       |
| salida. Los espacios, saltos de línea y formato  |
| son importantes.                                 |
+--------------------------------------------------+
```

La sección aparece:
- Después de la descripción del ejercicio
- Antes del editor de código
- Con fondo amber sutil para distinguirla del resto

## Ejemplo de buen `expectedOutput`

### Ejercicio: "Ficha personal con String"

```json
{
  "expectedOutput": "=== FICHA PERSONAL ===\nNombre: Maria Garcia Lopez\nCiudad: Malaga\nEdad: 19 anios\n======================"
}
```

### Ejercicio: "Calculadora básica"

```json
{
  "expectedOutput": "20 + 6 = 26\n20 - 6 = 14\n20 * 6 = 120\n20 / 6 = 3\n20 % 6 = 2"
}
```

## Reglas

1. **Exactitud**: El `expectedOutput` debe coincidir EXACTAMENTE con la salida de la solución. Incluir todos los espacios, saltos de línea y caracteres especiales.

2. **Sin prompt de entrada**: No incluir texto de tipo "Introduce tu nombre: " — esos prompts son parte de la interacción, no de la salida.

3. **Una línea por `println`**: Cada `System.out.println()` produce una línea. Usa `\n` para representar saltos de línea.

4. **No incluir errores**: El `expectedOutput` muestra solo la salida exitosa.

5. **Consistencia**: Si el ejercicio tiene múltiples soluciones válidas (por ejemplo, diferentes nombres), usar valores de ejemplo consistentes con la solución documentada.

## Ejercicios que NO necesitan `expectedOutput`

- Exercises using `Scanner` for input (mod-02 lesson 1, etc.)
- Exercises using `System.getProperty()` (environment-dependent)
- Debugging exercises where the task is to fix code
- Documentation exercises where the task is to write comments
- POO exercises focused on class design (no console output)
- Exercises focused on file I/O or database operations

## Plataformas de ejecución

El campo `expectedOutput` se usa para:
1. **Visualización**: Mostrar al estudiante qué salida esperar
2. **Validación futura**: Comparar la salida real del estudiante con la esperada (automatización pendiente)
3. **Documentación**: Sirve como referencia para instructores y contenido del curso
