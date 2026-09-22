/**
 * Learning outcomes for each module, derived from real course content.
 * Used in the public course detail page accordion.
 */

export const MODULE_OUTCOMES: Record<string, string[]> = {
  'mod-01': [
    'Comprender qué es un programa y cómo se ejecuta en Java.',
    'Configurar el entorno de desarrollo con Eclipse IDE.',
    'Declarar variables y utilizar los tipos de datos básicos.',
    'Aplicar operadores aritméticos, lógicos y de comparación.',
    'Escribir comentarios y documentar el código.',
  ],
  'mod-02': [
    'Leer datos del teclado utilizando la clase Scanner.',
    'Mostrar información formateada con printf y String.format.',
    'Conocer las principales librerías de entrada/salida de Java.',
  ],
  'mod-03': [
    'Crear programas que tomen decisiones mediante condiciones.',
    'Utilizar if, else if y else para controlar el flujo.',
    'Combinar condiciones con operadores lógicos AND, OR y NOT.',
    'Emplear switch cuando sea la estructura más apropiada.',
    'Depurar código con estructuras condicionales.',
  ],
  'mod-04': [
    'Implementar bucles for, while y do-while para repetir procesos.',
    'Utilizar break y continue para controlar la ejecución.',
    'Gestionar excepciones con try, catch y finally.',
    'Emplear aserciones para detectar errores en tiempo de desarrollo.',
  ],
  'mod-05': [
    'Dividir un programa en métodos reutilizables.',
    'Definir parámetros y valores de retorno.',
    'Comprender el ámbito de las variables locales.',
    'Aplicar sobrecarga de métodos cuando sea necesario.',
  ],
  'mod-06': [
    'Comprender el concepto de programación orientada a objetos.',
    'Definir clases con propiedades y métodos.',
    'Crear constructores para inicializar objetos.',
    'Utilizar getters y setters para acceder a los datos.',
    'Crear y utilizar objetos en programas reales.',
  ],
  'mod-07': [
    'Controlar el acceso a clases y miembros con modificadores de visibilidad.',
    'Utilizar miembros estáticos y constantes.',
    'Organizar el código en paquetes.',
  ],
  'mod-08': [
    'Comprender el concepto de herencia en Java.',
    'Utilizar super y this en contextos de herencia.',
    'Sobrescribir métodos de forma correcta.',
    'Gestionar constructores en jerarquías de herencia.',
  ],
  'mod-09': [
    'Aplicar polimorfismo para escribir código más flexible.',
    'Definir e implementar interfaces.',
    'Distinguir entre clases abstractas e interfaces.',
    'Elegir entre herencia y composición según el caso.',
  ],
  'mod-10': [
    'Diseñar jerarquías de clases complejas.',
    'Documentar código con Javadoc.',
    'Aplicar patrones de diseño introductorios.',
  ],
  'mod-11': [
    'Crear y manipular arrays unidimensionales.',
    'Trabajar con arrays bidimensionales y matrices.',
    'Implementar algoritmos de búsqueda y ordenación.',
    'Transformar y recorrer colecciones de datos.',
  ],
  'mod-12': [
    'Utilizar ArrayList para gestionar colecciones dinámicas.',
    'Recorrer colecciones de forma segura con iteradores.',
    'Aplicar genéricos para crear clases y métodos parametrizados.',
    'Validar datos con expresiones regulares.',
    'Trabajar con formatos de intercambio como JSON y XML.',
    'Aplicar operaciones funcionales: filter, map y reduce.',
  ],
  'mod-13': [
    'Comprender la jerarquía de excepciones en Java.',
    'Crear excepciones personalizadas para reglas de negocio.',
    'Utilizar try-with-resources para gestionar recursos automáticamente.',
  ],
  'mod-14': [
    'Trabajar con la clase File para gestionar ficheros.',
    'Leer y escribir ficheros de texto.',
    'Serializar y deserializar objetos en Java.',
  ],
  'mod-15': [
    'Crear interfaces gráficas con Swing: JFrame, JPanel y layouts.',
    'Utilizar componentes básicos: campos, botones y etiquetas.',
    'Manejar eventos de usuario en aplicaciones de escritorio.',
    'Desarrollar una aplicación completa con Swing.',
  ],
  'mod-16': [
    'Comprender las diferencias entre bases de datos orientadas a objetos y relacionales.',
    'Configurar y utilizar ObjectDB para persistir objetos.',
    'Realizar operaciones CRUD con JPA.',
    'Gestionar relaciones entre objetos complejos.',
  ],
  'mod-17': [
    'Comprender los conceptos fundamentales de JDBC.',
    'Ejecutar consultas SQL con Statement y ResultSet.',
    'Utilizar PreparedStatement para consultas parametrizadas.',
    'Gestionar transacciones y recursos en JDBC.',
    'Desarrollar una aplicación completa con PostgreSQL.',
  ],
  'mod-18': [
    'Planificar y diseñar un proyecto de programación completo.',
    'Implementar un modelo de datos funcional.',
    'Desarrollar la lógica de negocio de una aplicación.',
    'Gestionar la persistencia y realizar pruebas.',
    'Documentar y entregar el proyecto final.',
  ],
};

export const MODULE_LESSON_COUNTS: Record<string, number> = {
  'mod-01': 5, 'mod-02': 3, 'mod-03': 4, 'mod-04': 5,
  'mod-05': 4, 'mod-06': 5, 'mod-07': 3, 'mod-08': 4,
  'mod-09': 4, 'mod-10': 3, 'mod-11': 4, 'mod-12': 6,
  'mod-13': 3, 'mod-14': 4, 'mod-15': 4, 'mod-16': 5,
  'mod-17': 5, 'mod-18': 5,
};
