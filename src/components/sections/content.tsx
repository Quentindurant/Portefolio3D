import { ContactForm } from '@/components/ui/ContactForm';
import { JOURNEY, PROFILE, PROJECTS, STACK } from '@/content/profile';

/**
 * Contenu lisible de chaque tableau.
 * Volontairement compact : le décor porte l'émotion, le texte porte
 * l'information. Un bloc par station, sans habillage, l'enveloppe est gérée
 * par le panneau.
 */

export function LisiereContent() {
  return (
    <>
      <p className="lead">{PROFILE.tagline}</p>
      <dl className="facts">
        <div>
          <dt>Poste</dt>
          <dd>Alternant développeur et chef de projet</dd>
        </div>
        <div>
          <dt>Entreprise</dt>
          <dd>GC Développement</dd>
        </div>
        <div>
          <dt>Où</dt>
          <dd>{PROFILE.location}</dd>
        </div>
      </dl>
      <a className="button" href="#clairiere">
        Me contacter
      </a>
    </>
  );
}

export function SentierContent() {
  return (
    <div className="prose">
      {PROFILE.intro.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
    </div>
  );
}

export function SanctuaireContent() {
  return (
    <ul className="cards">
      {PROJECTS.map((project) => (
        <li className="card" key={project.name}>
          <h3 className="card__title">{project.name}</h3>
          <p className="card__meta">
            {project.role} · {project.year}
          </p>
          <p className="card__summary">{project.summary}</p>
          <ul className="tags" aria-label={`Technologies du projet ${project.name}`}>
            {project.stack.map((technology) => (
              <li className="tag" key={technology}>
                {technology}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function RacinesContent() {
  return (
    <ol className="timeline">
      {JOURNEY.map((step) => (
        <li className="timeline__item" key={step.title}>
          <p className="timeline__period">{step.period}</p>
          <h3 className="timeline__title">{step.title}</h3>
          <p className="timeline__place">{step.place}</p>
          <p className="timeline__detail">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export function GrimoireContent() {
  return (
    <div className="grimoire">
      {STACK.map((group) => (
        <article className="grimoire__group" key={group.label}>
          <h3 className="grimoire__label">{group.label}</h3>
          <ul className="tags">
            {group.items.map((item) => (
              <li className="tag" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function ClairiereContent() {
  return (
    <div className="contact">
      <div className="contact__intro prose">
        <p>Un projet, une alternance, une mission freelance ? Je réponds sous 48 heures.</p>
        <p>
          <a className="link" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
        </p>
        <ul className="contact__links">
          {PROFILE.links.map((link) => (
            <li key={link.label}>
              <a className="link" href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}

export const STATION_CONTENT = [
  LisiereContent,
  SentierContent,
  SanctuaireContent,
  RacinesContent,
  GrimoireContent,
  ClairiereContent,
] as const;
