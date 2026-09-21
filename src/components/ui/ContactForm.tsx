'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface ApiResponse {
  message?: string;
  errors?: Record<string, string>;
}

const FIELDS = [
  { name: 'name', label: 'Nom', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
] as const;

/**
 * Formulaire de contact.
 * La validation cliente est un confort : la source de vérité reste le schéma
 * Zod côté serveur, qui rejette tout ce qui ne lui plaît pas.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    // La référence doit être capturée avant le premier await : React remet
    // `currentTarget` à null dès que le gestionnaire rend la main.
    const form = event.currentTarget;
    setStatus('sending');
    setErrors({});

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setStatus('error');
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "L'envoi a échoué, réessaie dans un instant.");
        return;
      }

      setStatus('sent');
      setMessage(data.message ?? 'Message envoyé, merci.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage("Impossible de joindre le serveur. Écris-moi directement par e-mail.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {FIELDS.map((field) => (
        <div className="field" key={field.name}>
          <label className="field__label" htmlFor={`contact-${field.name}`}>
            {field.label}
          </label>
          <input
            className="field__input"
            id={`contact-${field.name}`}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `contact-${field.name}-error` : undefined}
          />
          {errors[field.name] ? (
            <p className="field__error" id={`contact-${field.name}-error`}>
              {errors[field.name]}
            </p>
          ) : null}
        </div>
      ))}

      <div className="field">
        <label className="field__label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          className="field__input field__input--area"
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message ? (
          <p className="field__error" id="contact-message-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Champ piège anti-robot : invisible et jamais rempli par un humain. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="button" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Envoi en cours' : 'Envoyer le message'}
      </button>

      <p className="contact-form__status" role="status" aria-live="polite" data-status={status}>
        {message}
      </p>
    </form>
  );
}
