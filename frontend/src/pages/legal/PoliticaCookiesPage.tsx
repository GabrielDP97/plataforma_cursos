import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

/* ============================================================================
   POLÍTICA DE COOKIES — AulaDev beta
   ============================================================================ */

export function PoliticaCookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      lastUpdated="22 de septiembre de 2026"
    >
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en tu
        dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde
        tus acciones y preferencias durante un período de tiempo.
      </p>

      <h2>2. Cookies que utiliza AulaDev</h2>
      <p>
        AulaDev utiliza un número mínimo de cookies, exclusivamente necesarias
        para el funcionamiento de la plataforma:
      </p>

      <h3>Cookies esenciales de sesión</h3>
      <ul>
        <li>
          <strong>Propósito:</strong> Mantener tu sesión de usuario activa y
          autenticada.
        </li>
        <li>
          <strong>Gestor:</strong> Better Auth (sistema de autenticación).
        </li>
        <li>
          <strong>Tipo:</strong> httpOnly — inaccesibles desde JavaScript por
          seguridad.
        </li>
        <li>
          <strong>Duración:</strong> Sesión (se eliminan al cerrar el
          navegador).
        </li>
        <li>
          <strong>Datos:</strong> Token de sesión cifrado.
        </li>
      </ul>

      <h2>3. ¿Qué NO utilizamos?</h2>
      <ul>
        <li>
          <strong>No</strong> utilizamos cookies de análisis o estadísticas (no
          hay Google Analytics ni similar).
        </li>
        <li>
          <strong>No</strong> utilizamos cookies de marketing o publicidad.
        </li>
        <li>
          <strong>No</strong> utilizamos cookies de rastreo de terceros.
        </li>
        <li>
          <strong>No</strong> utilizamos píxeles de seguimiento.
        </li>
      </ul>

      <h2>4. Almacenamiento local (localStorage)</h2>
      <p>
        AulaDev utiliza <code>localStorage</code> del navegador para almacenar
        preferencias locales. Estos datos no son cookies y no se envían al
        servidor:
      </p>
      <ul>
        <li>
          <strong>Preferencia de tema:</strong> modo claro/oscuro seleccionado
          por el usuario.
        </li>
        <li>
          <strong>Modo de vista del panel:</strong> preferencia de visualización
          del dashboard.
        </li>
      </ul>
      <p>
        Estos datos se almacenan exclusivamente en tu navegador y no se comparten
        con terceros.
      </p>

      <h2>5. ¿Necesito dar mi consentimiento?</h2>
      <p>
        No. Dado que AulaDev únicamente utiliza cookies esenciales para el
        funcionamiento de la plataforma, <strong>no es necesario obtener tu
        consentimiento</strong> para su uso, de conformidad con la normativa
        vigente en materia de protección de datos y cookies.
      </p>

      <h2>6. Gestión de cookies desde el navegador</h2>
      <p>
        Aunque las cookies esenciales son necesarias para el funcionamiento de la
        plataforma, puedes configurar tu navegador para bloquear o eliminar
        cookies. Ten en cuenta que si bloqueas las cookies de sesión, no podrás
        iniciar sesión en la plataforma.
      </p>
      <p>
        Consulta la ayuda de tu navegador para más información sobre cómo
        gestionar las cookies:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/gestionar-y-configurar-cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>7. Cambios en esta política</h2>
      <p>
        AulaDev se reserva el derecho de modificar esta política de cookies en
        cualquier momento. Los cambios serán publicados en esta página y serán
        efectivos desde su publicación.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política de cookies, puedes contactarnos a
        través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>
    </LegalPage>
  );
}
