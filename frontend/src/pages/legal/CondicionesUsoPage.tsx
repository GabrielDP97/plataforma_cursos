import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

/* ============================================================================
   CONDICIONES DE USO — AulaDev beta
   ============================================================================ */

export function CondicionesUsoPage() {
  return (
    <LegalPage
      title="Condiciones de uso"
      lastUpdated="22 de septiembre de 2026"
    >
      <h2>1. Acceptación de las condiciones</h2>
      <p>
        Al acceder y utilizar AulaDev, aceptas las presentes condiciones de
        uso. Si no estás de acuerdo con alguno de estos términos, no utilices la
        plataforma.
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        AulaDev es una plataforma educativa de formación informática, orientada
        a estudiantes de Formación Profesional (ciclos de DAM y DAW). Ofrece
        cursos con lecciones, ejercicios prácticos y materiales complementarios.
      </p>
      <p>
        Actualmente nos encontramos en fase beta. La plataforma está en proceso
        de desarrollo y puede experimentar cambios, mejoras o interrupciones
        temporales.
      </p>

      <h2>3. Cuentas de usuario</h2>
      <p>
        Las cuentas de usuario son creadas y asignadas por la administración de
        la plataforma. <strong>No existe registro público ni
        autoregistro.</strong>
      </p>
      <p>Cada usuario es responsable de:</p>
      <ul>
        <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
        <li>Notificar a la administración si sospecha un uso no autorizado de
          su cuenta.</li>
        <li>No compartir sus credenciales con terceros.</li>
        <li>No utilizar la cuenta de otro usuario.</li>
      </ul>

      <h2>4. Uso adecuado</h2>
      <p>Al utilizar AulaDev, te comprometes a:</p>
      <ul>
        <li>Utilizar la plataforma exclusivamente con fines educativos.</li>
        <li>Respetar el derecho de propiedad intelectual del contenido.</li>
        <li>No intentar acceder a áreas restringidas sin autorización.</li>
        <li>No realizar actividades que puedan dañar, sobrecargar o deteriorar
          la plataforma.</li>
        <li>No utilizar la plataforma para distribuir contenido malicioso,
          spam o cualquier tipo de material ilegal.</li>
        <li>Cumplir con la legislación vigente en todo momento.</li>
      </ul>

      <h2>5. Propiedad intelectual</h2>
      <p>
        Todo el contenido disponible en AulaDev, incluyendo pero no limitado a
        textos, ejercicios, código fuente, vídeos, imágenes y diseño de la
        interfaz, es propiedad de AulaDev o de sus autores y está protegido por
        la legislación de propiedad intelectual.
      </p>
      <p>
        Queda prohibida la reproducción, distribución, comunicación pública o
        transformación del contenido sin autorización expresa, salvo que la
        ley lo permita expresamente.
      </p>

      <h2>6. Disponibilidad</h2>
      <p>
        AulaDev hace esfuerzos razonables para mantener la plataforma
        disponible, pero no garantiza disponibilidad ininterrumpida ni libre de
        errores. La plataforma puede estar temporalmente no disponible por:
      </p>
      <ul>
        <li>Mantenimiento programado.</li>
        <li>Actualizaciones de la plataforma.</li>
        <li>Causas técnicas o circunstancias fuera de nuestro control.</li>
      </ul>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        AulaDev se proporciona tal cual, sin garantías de ningún tipo, tanto
        expresas como implícitas. En ningún caso seremos responsables de:
      </p>
      <ul>
        <li>Daños directos, indirectos, incidentales o consecuentes derivados
          del uso de la plataforma.</li>
        <li>Pérdida de datos o interrupciones del servicio.</li>
        <li>Errores u omisiones en el contenido.</li>
      </ul>

      <h2>8. Modificaciones</h2>
      <p>
        AulaDev se reserva el derecho de modificar estas condiciones de uso en
        cualquier momento. Las modificaciones serán publicadas en esta página y
        serán efectivas desde su publicación. El uso continuado de la plataforma
        después de los cambios constituye la aceptación de los mismos.
      </p>

      <h2>9. Legislación aplicable</h2>
      <p>
        Estas condiciones de uso se rigen por la legislación española. Para la
        resolución de cualquier controversia, las partes se someten a los
        juzgados y tribunales correspondientes.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Si tienes preguntas sobre estas condiciones de uso, puedes contactarnos a
        través de la{' '}
        <Link to="/contacto">página de contacto</Link>.
      </p>
    </LegalPage>
  );
}
