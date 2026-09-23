import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

/* ============================================================================
   CONDICIONES DE CONTRATACIÓN — AulaDev
   ============================================================================ */

export function CondicionesContratacionPage() {
  return (
    <LegalPage
      title="Condiciones de contratación"
      lastUpdated="22 de septiembre de 2026"
    >
      <h2>1. Objeto</h2>
      <p>
        Las presentes condiciones regulan la contratación de servicios
        educativos ofrecidos a través de la plataforma AulaDev, incluyendo
        la compra de cursos online y la contratación de clases particulares.
      </p>

      <h2>2. Identificación del prestador</h2>
      <p>
        {/* TODO: required before commercial launch — fill with legal entity data */}
        <strong>Nombre:</strong> [Por determinar]
        <br />
        <strong>NIF/CIF:</strong> [Por determinar]
        <br />
        <strong>Domicilio:</strong> [Por determinar]
        <br />
        <strong>Correo electrónico:</strong> [Por determinar]
        <br />
        <strong>Teléfono:</strong> [Por determinar]
      </p>

      <h2>3. Servicios disponibles</h2>
      <p>AulaDev ofrece los siguientes servicios:</p>
      <ul>
        <li>
          <strong>Cursos online:</strong> contenidos educativos compuestos por
          lecciones, ejercicios prácticos y materiales complementarios, con
          acceso a través de la plataforma.
        </li>
        <li>
          <strong>Clases particulares:</strong> sesiones individuales o en
          grupo impartidas por profesores especializados, con horarios
          acordados entre las partes.
        </li>
      </ul>

      <h2>4. Precios</h2>
      <p>Los precios vigentes son:</p>
      <ul>
        <li>
          <strong>Curso online:</strong> 10 € (diez euros) por curso.
        </li>
        <li>
          <strong>Clase particular:</strong> 12 € (doce euros) por hora.
        </li>
      </ul>
      <p>
        Todos los precios incluyen los impuestos aplicables. AulaDev se
        reserva el derecho de modificar los precios, comunicándolo con
        antelación suficiente.
      </p>

      <h2>5. Procedimiento de solicitud de información</h2>
      <p>
        Para contratar cualquier servicio, el usuario deberá solicitar
        información a través del{' '}
        <Link to="/contacto">formulario de contacto</Link> de la plataforma,
        indicando el servicio que le interesa.
      </p>

      <h2>6. Procedimiento de contratación</h2>
      <p>
        El proceso de contratación es el siguiente:
      </p>
      <ol>
        <li>El usuario solicita información del servicio deseado a través
          del formulario de contacto.</li>
        <li>AulaDev confirma la disponibilidad del servicio y proporciona
          los detalles de la contratación.</li>
        <li>El usuario confirma la contratación y procede al pago mediante
          el método de pago acordado.</li>
        <li>AulaDev confirma la recepción del pago y activa el acceso al
          servicio contratado.</li>
      </ol>
      <p>
        No existe autocompra ni carrito de la compra. Toda contratación se
        gestiona de forma manual entre el usuario y AulaDev.
      </p>

      <h2>7. Forma de pago</h2>
      <p>
        {/* TODO: business decision needed — confirm payment method before launch */}
        Los pagos se realizan mediante [método de pago por determinar].
        AulaDev no almacena datos de tarjetas de crédito ni otra información
        bancaria en la plataforma.
      </p>

      <h2>8. Activación del acceso</h2>
      <p>
        Una vez confirmado el pago, se procederá a la activación del acceso
        al servicio contratado. El acceso se realizará a través de la cuenta
        de usuario asignada por la administración de la plataforma.
      </p>
      <p>
        El tiempo máximo de activación será de 48 horas hábiles desde la
        confirmación del pago.
      </p>

      <h2>9. Duración del acceso</h2>
      <p>
        {/* TODO: business decision needed — define access duration model */}
        [Por determinar: modelo de duración del acceso a los cursos.
        Opciones: acceso permanente, acceso por tiempo determinado, etc.]
      </p>

      <h2>10. Clases particulares</h2>
      <p>
        Las clases particulares se contratan por hora y se imparten de forma
        individual o en grupo, según la disponibilidad del profesor.
      </p>
      <p>
        El horario y la modalidad de la clase se acuerdan entre el alumno y
        el profesor, pudiendo ser presencial o en línea a través de la
        plataforma.
      </p>

      <h2>11. Cancelaciones</h2>
      <p>
        {/* TODO: business decision needed — define cancellation policy */}
        [Por determinar: política de cancelación de clases particulares y
        cursos. Plazos, reembolsos, etc.]
      </p>

      <h2>12. Derecho de desistimiento</h2>
      <p>
        {/* TODO: requires legal review — consumers may have 14-day right under EU law */}
        [Por determinar: condicionado a revisión legal. El consumidor puede
        tener derecho a desistir en un plazo de 14 días desde la contratación,
        salvo en contenido digital descargado o servicios iniciados con
        consentimiento del consumidor.]
      </p>

      <h2>13. Contenido digital</h2>
      <p>
        El contenido de los cursos es propiedad de AulaDev o de sus autores y
        está protegido por la legislación de propiedad intelectual. La
        contratación de un curso otorga al usuario un derecho de uso personal
        e intransferible del contenido.
      </p>
      <p>
        Queda prohibida la reproducción, distribución, comunicación pública o
        transformación del contenido sin autorización expresa.
      </p>

      <h2>14. Obligaciones del alumno</h2>
      <p>El alumno se compromete a:</p>
      <ul>
        <li>Utilizar la plataforma y los servicios exclusivamente con fines
          educativos.</li>
        <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
        <li>No compartir el acceso ni el contenido del curso con terceros.</li>
        <li>Cumplir con las normas de comportamiento establecidas en las
          condiciones de uso.</li>
        <li>Respetar al profesor y a los demás alumnos durante las clases
          particulares.</li>
      </ul>

      <h2>15. Incidencias y reclamaciones</h2>
      <p>
        Para cualquier incidencia relativa a la contratación o prestación de
        servicios, el usuario puede contactar a través del{' '}
        <Link to="/contacto">formulario de contacto</Link>.
      </p>
      <p>
        Si el usuario no está satisfecho con la resolución de su incidencia,
        puede presentar una reclamación formal ante las autoridades competentes.
      </p>

      <h2>16. Contacto</h2>
      <p>
        Si tienes preguntas sobre estas condiciones de contratación, puedes
        contactarnos a través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>

      <h2>17. Legislación aplicable</h2>
      <p>
        Estas condiciones de contratación se rigen por la legislación española.
        Para la resolución de cualquier controversia, las partes se someten a
        los juzgados y tribunales correspondientes.
      </p>
    </LegalPage>
  );
}
