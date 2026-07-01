import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/common/Container";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: { absolute: "Política de Privacidad | RunClubs.es" },
  description: "Información sobre el tratamiento de datos personales en RunClubs.es.",
  robots: { index: true, follow: false },
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <Container>
      <article className="prose prose-neutral mx-auto max-w-2xl py-12 dark:prose-invert">
        <h1>{es.legal.privacyTitle}</h1>
        <p className="lead">
          En RunClubs.es respetamos tu privacidad y tratamos tus datos personales conforme al
          Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos
          Personales y garantía de los derechos digitales (LOPDGDD).
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li>
            <strong>Responsable:</strong> RunClubs.es, S.L. (titular del servicio RunClubs.es)
          </li>
          <li>
            <strong>Contacto:</strong>{" "}
            <a href="mailto:privacidad@runclubs.es">privacidad@runclubs.es</a>
          </li>
          <li>
            <strong>Delegado de Protección de Datos (DPO):</strong> no designado (empresa de
            dimensiones reducidas)
          </li>
        </ul>

        <h2>2. Datos que recopilamos</h2>
        <ul>
          <li>
            <strong>Datos de registro:</strong> dirección de correo electrónico y nombre (mediante
            inicio de sesión con Google o enlace mágico por email).
          </li>
          <li>
            <strong>Datos de actividad:</strong> clubs a los que te unes, carreras a las que te
            apuntas y, en su caso, rol en clubs.
          </li>
          <li>
            <strong>Datos opcionales de perfil:</strong> ciudad e imagen de perfil (esta última
            puede proceder del proveedor OAuth).
          </li>
          <li>
            <strong>Newsletter:</strong> email y fecha de suscripción al boletín semanal.
          </li>
          <li>
            <strong>Cookies y tecnologías similares:</strong> ver sección 6.
          </li>
        </ul>

        <h2>3. Finalidad y base legal</h2>
        <ul>
          <li>
            <strong>Prestación del servicio</strong> (gestión de cuenta, membresías y asistencia a
            carreras): ejecución de contrato o aplicación de medidas precontractuales (art. 6.1.b
            RGPD).
          </li>
          <li>
            <strong>Newsletter:</strong> envío de comunicaciones sobre carreras y novedades del
            servicio, solo con tu consentimiento explícito (art. 6.1.a RGPD).
          </li>
          <li>
            <strong>Estadísticas anónimas de uso</strong> y mejora del servicio: interés legítimo
            (art. 6.1.f RGPD), siempre que no prevalezcan tus derechos.
          </li>
          <li>
            <strong>Cookies esenciales:</strong> necesarias para el funcionamiento técnico del
            sitio (sesión, preferencias de consentimiento).
          </li>
        </ul>

        <h2>4. Conservación de datos</h2>
        <ul>
          <li>
            <strong>Cuenta de usuario:</strong> mientras mantengas la cuenta activa o solicites su
            supresión.
          </li>
          <li>
            <strong>Newsletter:</strong> hasta que te des de baja o retires el consentimiento.
          </li>
          <li>
            <strong>Logs de auditoría administrativa:</strong> hasta 2 años desde su registro.
          </li>
        </ul>

        <h2>5. Derechos del usuario</h2>
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión, portabilidad,
          limitación del tratamiento y oposición contactando en{" "}
          <a href="mailto:privacidad@runclubs.es">privacidad@runclubs.es</a>. Responderemos en el
          plazo legalmente establecido.
        </p>
        <p>
          Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una
          reclamación ante la Agencia Española de Protección de Datos (AEPD):{" "}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            www.aepd.es
          </a>
          .
        </p>

        <h2>6. Cookies</h2>
        <p>
          Utilizamos cookies propias estrictamente necesarias para el funcionamiento del sitio (por
          ejemplo, mantener tu sesión y recordar tu elección de consentimiento de cookies).
        </p>
        <p>
          Con tu consentimiento, podremos usar cookies de analítica para entender el uso agregado del
          servicio. Puedes aceptar todas las cookies o limitarte a las esenciales mediante el banner
          mostrado en tu primera visita. Puedes cambiar de opinión eliminando la clave{" "}
          <code>runclubs_cookie_consent</code> de tu navegador.
        </p>

        <h2>7. Menores</h2>
        <p>
          RunClubs.es no está dirigido a menores de 16 años. No recopilamos de forma consciente
          datos personales de menores de esa edad. Si detectamos que hemos recibido datos de un
          menor, procederemos a su eliminación.
        </p>

        <h2>8. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios legales o del servicio. Si los
          cambios son relevantes para tus derechos, te lo notificaremos por email o mediante un aviso
          destacado en el sitio.
        </p>

        <p>
          <Link href="/terminos">Términos de Uso</Link>
        </p>
      </article>
    </Container>
  );
}
