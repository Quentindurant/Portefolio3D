import { describe, expect, it } from 'vitest';
import { sanitizeText, validateContact } from '../contact-schema';

const valid = {
  name: 'Camille Bertin',
  email: 'camille@example.com',
  message: 'Bonjour, je cherche un développeur pour un projet Next.js.',
  website: '',
};

describe('sanitizeText', () => {
  it('neutralise les caractères de contrôle et les retours chariot', () => {
    expect(sanitizeText('Bcc: pirate@example.com\r\nSujet')).toBe(
      'Bcc: pirate@example.com  Sujet',
    );
  });
});

describe('validateContact', () => {
  it('accepte un message conforme', () => {
    const result = validateContact(valid);
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('camille@example.com');
  });

  it('refuse une adresse e-mail invalide', () => {
    const result = validateContact({ ...valid, email: 'pas-une-adresse' });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeDefined();
  });

  it('refuse un nom trop court et un message trop court', () => {
    const result = validateContact({ ...valid, name: 'Q', message: 'court' });
    expect(result.success).toBe(false);
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.message).toBeDefined();
  });

  it('refuse un message dépassant la taille maximale', () => {
    const result = validateContact({ ...valid, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejette le remplissage du champ piège', () => {
    const result = validateContact({ ...valid, website: 'http://spam.example' });
    expect(result.success).toBe(false);
    expect(result.errors?.website).toBeDefined();
  });

  it('rejette une charge utile qui n est pas un objet', () => {
    expect(validateContact('bonjour').success).toBe(false);
    expect(validateContact(null).success).toBe(false);
  });
});
