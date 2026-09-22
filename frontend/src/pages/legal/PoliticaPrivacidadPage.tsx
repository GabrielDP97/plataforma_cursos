import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

/* ============================================================================
   POLÍTICA DE PRIVACIDAD — AulaDev
   ============================================================================ */

export function PoliticaPrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      lastUpdated="22 de septiembre de 2026"
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales en AulaDev es el
        administrador de la plataforma. Para cualquier consulta relativa al
        tratamiento de tus datos, puedes contactarnos a través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>
        AulaDev recopila únicamente los datos estrictamente necesarios para
        el funcionamiento de la plataforma:
      </p>
      <ul>
        <li>
          <strong>Datos de cuenta de usuario:</strong> nombre, correo electrónico
          y nombre de usuario. Estas cuentas son creadas por la administración
          de la plataforma; no existe registro público.
        </li>
        <li>
          <strong>Credenciales de acceso:</strong> las contraseñas se almacenan
          de forma segura utilizando el algoritmo de hashing scrypt, proporcionado
          por Better Auth. No almacenamos contraseñas en texto plano.
        </li>
        <li>
          <strong>Tokens de sesión:</strong> se utilizan cookies httpOnly
          esenciales para mantener la sesión del usuario autenticado.
        </li>
        <li>
          <strong>Inscripción y progreso en cursos:</strong> registro de cursos
          en los que estás inscrito y tu progreso de aprendizaje.
        </li>
        <li>
          <strong>Mensajes de contacto:</strong> si utilizas el formulario de
          contacto, recopilamos tu nombre, correo electrónico y el contenido del
          mensaje.
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Utilizamos tus datos para:</p>
      <ul>
        <li>Gestionar tu cuenta de usuario y permitirte acceder a la plataforma.</li>
        <li>Administrar tu inscripción a cursos, registrar tu progreso y
          facilitar el acceso al contenido educativo.</li>
        <li>Responder a tus consultas enviadas a través del formulario de
          contacto.</li>
        <li>Garantizar la seguridad de la plataforma y prevenir accesos no
          autorizados.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento de tus datos se fundamenta en la prestación del
        servicio educativo y en tu consentimiento cuando contactas con nosotros.
      </p>

      <h2>5. Servicios de terceros</h2>
      <p>
        Para el funcionamiento de la plataforma utilizamos los siguientes
        proveedores de servicios:
      </p>
      <ul>
        <li>
          <strong>Cloudflare:</strong> alojamiento y protección de la plataforma.
        </li>
        <li>
          <strong>Neon:</strong> base de datos en la que se almacenan los datos
          de la plataforma.
        </li>
        <li>
          <strong>Resend:</strong> envío de correos electrónicos transaccionales
          (notificaciones de cuenta, respuestas de contacto).
        </li>
      </ul>
      <p>
        Estos proveedores actúan como encargados del tratamiento y garantizan
        el cumplimiento de la normativa de protección de datos.
      </p>

      <h2>6. Cookies y technologies de rastreo</h2>
      <p>
        AulaDev no utiliza cookies de análisis, marketing ni rastreo de terceros.
        Las únicas cookies utilizadas son las esenciales para el funcionamiento
        de la sesión de usuario (cookies httpOnly gestionadas por Better Auth).
        Para más detalles, consulta nuestra{' '}
        <Link to="/cookies">Política de cookies</Link>.
      </p>

      <h2>7. Conservación de datos</h2>
      <p>
        Tus datos personales se conservan mientras mantengas tu cuenta activa.
        Si solicitas la eliminación de tu cuenta, tus datos serán eliminados o
        anonimizados en un plazo máximo de 30 días.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Conforme a la normativa vigente de protección de datos, tienes derecho a:
      </p>
      <ul>
        <li>
          <strong>Acceso:</strong> conocer qué datos personales tenemos sobre ti.
        </li>
        <li>
          <strong>Rectificación:</strong> solicitar la corrección de datos
          inexactos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar la eliminación de tus datos
          personales.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir tus datos en un formato
          estructurado y de uso común.
        </li>
        <li>
          <strong>Oposición y limitación:</strong> oponerte al tratamiento o
          solicitar su limitación en determinadas circunstancias.
        </li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, contacta con nosotros a
        través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>

      <h2>9. Menores de edad</h2>
      <p>
        Las cuentas en AulaDev son creadas por la administración de la
        plataforma. Si eres menor de edad y necesitas que se eliminen tus datos,
        solicítalo a través de la{' '}
        <Link to="/contacto">página de contacto</Link> y atenderemos tu
        solicitud.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        AulaDev se reserva el derecho de modificar esta política de privacidad
        en cualquier momento. Los cambios serán publicados en esta página y serán
        efectivos desde su publicación.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política de privacidad o sobre el
        tratamiento de tus datos, puedes contactarnos a través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>
    </LegalPage>
  );
}
