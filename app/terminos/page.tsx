import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/common/Container";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: { absolute: "Términos de Uso | RunClubs.es" },
  description: "Condiciones de uso del servicio RunClubs.es.",
  robots: { index: true, follow: false },
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <Container>
      <article className="prose prose-neutral mx-auto max-w-2xl py-12 dark:prose-invert">
        <h1>{es.legal.termsTitle}</h1>
        <p className="lead">
          Estos Términos de Uso regulan el acceso y la utilización del sitio web RunClubs.es. Al
          utilizar el servicio, aceptas estas condiciones.
        </p>

        <h2>1. Objeto del servicio</h2>
        <p>
          RunClubs.es es un directorio en línea de clubs de running en España. Facilita la
          conexión entre corredores y grupos locales, y la consulta de carreras y eventos
          publicados por terceros. RunClubs.es no organiza ni dirige las salidas o competiciones
          listadas en la plataforma.
        </p>

        <h2>2. Registro y cuenta</h2>
        <ul>
          <li>Debes tener al menos 16 años para registrarte y usar el servicio.</li>
          <li>
            Te comprometes a proporcionar datos verídicos y mantener actualizada la información de
            tu cuenta.
          </li>
          <li>
            Eres responsable de la confidencialidad de tu acceso (enlace mágico, sesión OAuth u
            otros métodos de autenticación disponibles).
          </li>
        </ul>

        <h2>3. Uso del servicio</h2>
        <p>Queda prohibido, entre otros:</p>
        <ul>
          <li>Enviar spam o comunicaciones no solicitadas a otros usuarios.</li>
          <li>Publicar contenido ilegal, difamatorio o que infrinja derechos de terceros.</li>
          <li>Realizar scraping masivo o uso automatizado que degrade el servicio.</li>
          <li>Suplantar la identidad de otra persona o entidad.</li>
        </ul>
        <p>
          Los clubs son responsables de la veracidad de la información que publican (horarios,
          ubicaciones, descripciones). RunClubs.es se reserva el derecho de dar de baja clubs o
          usuarios que incumplan estas normas o las políticas internas.
        </p>

        <h2>4. Contenido de usuarios</h2>
        <p>
          Al publicar información en RunClubs.es (por ejemplo, datos de un club), concedes a
          RunClubs.es una licencia no exclusiva, gratuita y limitada al territorio necesario para
          mostrar, indexar y promocionar ese contenido en el directorio y canales relacionados del
          servicio.
        </p>
        <p>
          RunClubs.es no es responsable del contenido publicado por clubs o usuarios, sin perjuicio
          de las acciones de moderación que pueda adoptar.
        </p>

        <h2>5. Exención de responsabilidad</h2>
        <ul>
          <li>
            Las carreras y quedadas listadas son organizadas por terceros. RunClubs.es no garantiza
            su celebración ni se hace responsable de incidencias, lesiones o daños derivados de la
            participación.
          </li>
          <li>
            La información meteorológica mostrada en el sitio es orientativa y procede de fuentes
            externas.
          </li>
          <li>
            El servicio se presta «tal cual», dentro de los límites permitidos por la ley aplicable.
          </li>
        </ul>

        <h2>6. Ley aplicable</h2>
        <p>
          Estos términos se rigen por la legislación española. Para cualquier controversia, las
          partes se someten a los juzgados y tribunales de Madrid, salvo normativa imperativa en
          contrario aplicable a consumidores.
        </p>

        <h2>7. Contacto</h2>
        <p>
          Para consultas sobre estos términos:{" "}
          <a href="mailto:hola@runclubs.es">hola@runclubs.es</a>
        </p>

        <p>
          <Link href="/privacidad">Política de Privacidad</Link>
        </p>
      </article>
    </Container>
  );
}
