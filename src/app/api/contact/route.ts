import { NextResponse, type NextRequest } from 'next/server';
import { validateContact, type ContactInput } from '@/lib/contact-schema';
import { clientKeyFromHeaders, createRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** 5 messages par quart d'heure et par IP : large pour un humain, étroit pour un robot. */
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

const MAX_BODY_BYTES = 8_000;

/**
 * Point de livraison du message.
 * Pour l'instant le message est journalisé côté serveur ; brancher ici un SMTP
 * ou une API transactionnelle ne demande que de remplacer ce corps de fonction.
 */
async function deliverMessage(input: ContactInput): Promise<void> {
  const inbox = process.env.CONTACT_INBOX ?? 'non configuré';
  logger.info('contact.message', {
    inbox,
    from: input.email,
    name: input.name,
    length: input.message.length,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: 'Message trop volumineux.' }, { status: 413 });
  }

  const rate = limiter.check(clientKeyFromHeaders(request.headers));
  if (!rate.allowed) {
    return NextResponse.json(
      { message: 'Trop de messages envoyés. Réessaie dans quelques minutes.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requête illisible.' }, { status: 400 });
  }

  const validation = validateContact(payload);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { message: 'Merci de corriger les champs signalés.', errors: validation.errors },
      { status: 400 },
    );
  }

  await deliverMessage(validation.data);

  return NextResponse.json(
    { message: 'Message reçu, merci. Je te réponds très vite.' },
    { status: 202 },
  );
}
