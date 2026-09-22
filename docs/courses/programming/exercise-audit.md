# Exercise Audit — Programming Course V2

> **Date**: 2026-09-19
> **Total exercises**: 236 across 18 modules
> **Source**: `courses/programming/modules/mod-XX.json` (metadata only)
> **Status**: NOT imported as database entities

---

## Summary by Module

| Module | Title | Exercises |
|--------|-------|-----------|
| mod-01 | Introduccion a la programacion y el entorno | 17 |
| mod-02 | Entrada/salida basica y formateo | 9 |
| mod-03 | Estructuras de control - seleccion | 12 |
| mod-04 | Estructuras de control - repeticion y excepciones | 15 |
| mod-05 | Metodos y funciones | 12 |
| mod-06 | POO - Clases y objetos | 15 |
| mod-07 | POO - Encapsulacion | 9 |
| mod-08 | POO - Herencia | 11 |
| mod-09 | POO - Polimorfismo e interfaces | 12 |
| mod-10 | POO - Avanzado | 9 |
| mod-11 | Arrays y matrices | 13 |
| mod-12 | Colecciones y genericos | 15 |
| mod-13 | Excepciones avanzadas | 9 |
| mod-14 | Ficheros y persistencia | 12 |
| mod-15 | Interfaces graficas con Java Swing | 15 |
| mod-16 | Bases de datos orientadas a objetos | 15 |
| mod-17 | Acceso a bases de datos con JDBC | 15 |
| mod-18 | Proyecto integrador final | 18 |

## Summary by Difficulty

| Difficulty | Count | Percentage |
|-----------|-------|------------|
| basic | ~78 | 33% |
| intermediate | ~80 | 34% |
| advanced | ~78 | 33% |

## Key Observations

1. **All exercises have solutions** — every exercise in the JSON includes a `solution` field
2. **Solution length ranges** from ~8 lines (basic exercises) to ~40 lines (advanced mini-projects)
3. **All exercises are code-type** — no quiz, debugging, prediction, or reading exercises exist yet
4. **Language**: Java 21 (all code examples)
5. **Exercise naming convention**: `ex-MM-L-NN` where MM=module, L=lesson, NN=exercise number within lesson
6. **Most lessons have 3 exercises** (basic/intermediate/advanced), some have 4

## Exercise Distribution Pattern

The dominant pattern is **3 exercises per lesson** with progressive difficulty:
- Exercise 1: **basic** — direct application of the lesson concept
- Exercise 2: **intermediate** — combining multiple concepts
- Exercise 3: **advanced** — complex scenario or mini-project

Lessons with 4 exercises (ex-01-3, ex-01-4, ex-01-5, ex-04-5, ex-11-1) add extra complexity.

## Architecture Recommendations

1. **Exercise type `code`** covers 100% of existing exercises — the `Exercise.type` field should default to `'code'`
2. **No test cases exist** — `ExerciseTestCase` will need to be created from scratch during import
3. **Solution visibility** should be controlled: hidden for students, visible for admins in preview mode
4. **Starter code** is not in the JSON — could be extracted from solutions by removing the body
5. **Hints** are not in the JSON — could be derived from `commonErrors` arrays in each lesson
