import { StationPanels } from '@/components/ui/StationPanels';
import { SECTIONS } from '@/content/sections';

/**
 * La page ne défile pas au sens habituel : la hauteur du rail sert uniquement
 * à convertir le scroll en progression de voyage. Le contenu, lui, reste fixe
 * et change de tableau au rythme de la caméra.
 */
export default function HomePage() {
  return (
    <>
      <div
        className="journey-track"
        style={{ height: `${SECTIONS.length * 115}vh` }}
        aria-hidden="true"
      />
      <main className="stage">
        <StationPanels />
      </main>
    </>
  );
}
