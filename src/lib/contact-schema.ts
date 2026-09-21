import { z } from 'zod';

/** Retire les caracteres de controle pouvant servir a une injection d'en-tete mail. */
export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
}

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caracteres.')
    .max(80, 'Le nom est trop long.')
    .transform(sanitizeText),
  email: z
    .string()
    .trim()
    .max(160, "L'adresse e-mail est trop longue.")
    .pipe(z.email("L'adresse e-mail est invalide.")),
  message: z
    .string()
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caracteres.')
    .max(2000, 'Le message est trop long (2000 caracteres maximum).')
    .transform(sanitizeText),
  /** Champ piege : rempli uniquement par les robots. */
  website: z.string().max(0, 'Requete rejetee.').optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;

export interface ContactValidation {
  success: boolean;
  data?: ContactInput;
  errors?: Record<string, string>;
}

export function validateContact(payload: unknown): ContactValidation {
  const result = contactSchema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return { success: false, errors };
}
