import React from 'react';
import { Clock, X } from 'lucide-react';
import { SlideData } from '../types/presentation';

interface SpeakerNotesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  elapsedOnSlide: number;
  totalElapsed: number;
  totalDeckDuration: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const SpeakerNotesOverlay: React.FC<SpeakerNotesOverlayProps> = ({
  isOpen,
  onClose,
  slide,
  slideIndex,
  totalSlides,
  elapsedOnSlide,
  totalElapsed,
  totalDeckDuration,
}) => {
  if (!isOpen) return null;

  const targetSec = slide.contenu?.duree_secondes || 25;
  const isOverTime = elapsedOnSlide > targetSec;

  return (
    <aside
      className="fixed bottom-20 start-6 z-40 w-[min(92vw,30rem)] rounded-2xl border border-white/15 bg-[#0A0A0F]/92 p-5 text-start text-white backdrop-blur-md"
      aria-label="Speaker Notes and Pitch Timer"
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF9F55]">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Slide {slideIndex + 1}/{totalSlides} · {slide.type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-xs font-bold tabular-nums ${
              isOverTime ? 'text-rose-400' : 'text-white/85'
            }`}
          >
            {formatTime(elapsedOnSlide)} / {formatTime(targetSec)}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-white/45">
            Total {formatTime(totalElapsed)} / {formatTime(totalDeckDuration)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
            aria-label="Close Speaker Notes"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-white/90 sm:text-sm">
        {slide.contenu?.note_speaker || 'No speaker notes provided for this slide.'}
      </p>

      {slide['visual-idea'] && (
        <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-white/55">
          <strong className="text-white/75">Visual cue: </strong>
          {slide['visual-idea']}
        </p>
      )}
    </aside>
  );
};
