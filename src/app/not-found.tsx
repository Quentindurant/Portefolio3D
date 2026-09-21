import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="fallback">
      <p className="fallback__kicker">Erreur 404</p>
      <h1 className="fallback__title">Ce sentier ne mène nulle part</h1>
      <p className="fallback__text">
        La page demandée s&apos;est perdue dans la canopée.
      </p>
      <Link className="button button--ghost" href="/">
        Revenir à la lisière
      </Link>
    </main>
  );
}
