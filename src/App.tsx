import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Languages,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import { SlideRenderer } from './components/SlideRenderer';
import { SpaceVisualCanvas } from './components/SpaceVisualCanvas';
import { SpeakerNotesOverlay } from './components/SpeakerNotesOverlay';
import { StudioDrawer } from './components/StudioDrawer';
import {
  DEFAULT_PRESENTATION,
  resolveSlideLayout,
} from './data/defaultPresentation';
import {
  PresentationData,
  SlideLayoutKind,
  SlideVisualOverride,
  UploadedImageItem,
} from './types/presentation';

export default function App() {
  const [presentation, setPresentation] = useState<PresentationData>(
    DEFAULT_PRESENTATION
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isRtl, setIsRtl] = useState<boolean>(
    DEFAULT_PRESENTATION.presentation.direction === 'rtl'
  );
  const [accentColor, setAccentColor] = useState<string>(
    DEFAULT_PRESENTATION.presentation.accentColor || '#FF9F55'
  );
  const [cardRadius, setCardRadius] = useState<number>(24);
  const [aiTool, setAiTool] = useState<string>(
    DEFAULT_PRESENTATION.presentation.aiTool || 'IA studio tools'
  );

  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [slideOverrides, setSlideOverrides] = useState<
    Record<number, SlideVisualOverride>
  >({});

  // Pitch elapsed timers (seconds)
  const [elapsedOnSlide, setElapsedOnSlide] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageFrameRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  useEffect(() => {
    const el = stageFrameRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isCompactMobile = stageSize.width < 600;
  const stageScale = Math.min(stageSize.width / 1280, stageSize.height / 720);

  const slides = presentation.slides;
  const safeIndex = Math.min(currentIndex, Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIndex];

  // Sync CSS custom properties & document direction
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', accentColor);
    root.style.setProperty('--radius-card', `${cardRadius}px`);
  }, [accentColor, cardRadius]);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl]);

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, index));
      setCurrentIndex(clamped);
      setElapsedOnSlide(0);
    },
    [slides.length]
  );

  const goNext = useCallback(() => {
    if (safeIndex < slides.length - 1) {
      goToSlide(safeIndex + 1);
    } else if (autoAdvance) {
      goToSlide(0);
    }
  }, [safeIndex, slides.length, goToSlide, autoAdvance]);

  const goPrev = useCallback(() => {
    if (safeIndex > 0) {
      goToSlide(safeIndex - 1);
    }
  }, [safeIndex, goToSlide]);

  // Pitch timer & optional auto-advance based on each slide's duree_secondes
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setTotalElapsed((t) => t + 1);
      setElapsedOnSlide((s) => {
        const nextSec = s + 1;
        const limit = currentSlide?.contenu?.duree_secondes || 25;
        if (autoAdvance && nextSec >= limit) {
          goNext();
          return 0;
        }
        return nextSec;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPlaying, autoAdvance, currentSlide, goNext]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const target = stageContainerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.().catch(() => {
        /* fallback silently in sandboxed iframes */
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isRtl) goPrev();
        else goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isRtl) goNext();
        else goPrev();
      } else if (e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(slides.length - 1);
      } else if (e.key.toLowerCase() === 'p') {
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === 'n') {
        setIsNotesOpen((n) => !n);
      } else if (e.key.toLowerCase() === 'r') {
        setIsRtl((r) => !r);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'u') {
        setIsStudioOpen((s) => !s);
      } else if (e.key === 'Escape') {
        setIsStudioOpen(false);
        setIsNotesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, goToSlide, slides.length, isRtl, toggleFullscreen]);

  const totalDeckDuration = useMemo(() => {
    if (presentation.presentation.total_duration_seconds) {
      return presentation.presentation.total_duration_seconds;
    }
    return slides.reduce(
      (sum, s) => sum + (s.contenu?.duree_secondes || 25),
      0
    );
  }, [presentation, slides]);

  const activeLayout = resolveSlideLayout(
    safeIndex,
    currentSlide?.layoutPreset
  );

  const progressPercent =
    slides.length > 1 ? ((safeIndex + 1) / slides.length) * 100 : 100;

  const handleUpdatePresentation = (next: PresentationData) => {
    setPresentation(next);
    setCurrentIndex(0);
    setElapsedOnSlide(0);
    setTotalElapsed(0);
    if (next.presentation?.direction) {
      setIsRtl(next.presentation.direction === 'rtl');
    }
    if (next.presentation?.accentColor) {
      setAccentColor(next.presentation.accentColor);
    }
    if (next.presentation?.aiTool) {
      setAiTool(next.presentation.aiTool);
    }
  };

  const handleResetPresentation = () => {
    setPresentation(DEFAULT_PRESENTATION);
    setCurrentIndex(0);
    setElapsedOnSlide(0);
    setTotalElapsed(0);
    setIsRtl(false);
    setAccentColor('#FF9F55');
    setCardRadius(24);
    setAiTool(
      DEFAULT_PRESENTATION.presentation.aiTool || 'IA studio tools'
    );
    setSlideOverrides({});
  };

  const handleChangeSlideLayout = (slideId: number, layout: SlideLayoutKind) => {
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId ? { ...s, layoutPreset: layout } : s
      ),
    }));
  };

  const handleAssignSlideVisual = (
    slideId: number,
    override: SlideVisualOverride | null
  ) => {
    setSlideOverrides((prev) => {
      const next = { ...prev };
      if (override === null) {
        delete next[slideId];
      } else {
        next[slideId] = override;
      }
      return next;
    });
  };

  return (
    <div
      ref={stageContainerRef}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-white select-none"
    >
      {/* 16:9 Presentation Frame */}
      <main
        className="relative flex w-full max-w-[1600px] flex-1 items-center justify-center px-2 pt-2 pb-1 sm:px-6 sm:pt-4"
        onTouchStart={(e) => {
          touchStartXRef.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartXRef.current === null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
          const delta = endX - touchStartXRef.current;
          touchStartXRef.current = null;
          if (Math.abs(delta) > 48) {
            if (delta < 0) {
              if (isRtl) goPrev();
              else goNext();
            } else {
              if (isRtl) goNext();
              else goPrev();
            }
          }
        }}
      >
        <div
          ref={stageFrameRef}
          className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
          style={{
            width: 'min(100%, calc((100vh - 5.75rem) * 16 / 9))',
            minHeight: isCompactMobile ? '420px' : undefined,
          }}
          aria-roledescription="slide"
          aria-label={`Slide ${safeIndex + 1} of ${slides.length}: ${currentSlide?.title || ''}`}
        >
          {/* Procedural Space Visual or Custom Uploaded Image */}
          {currentSlide && (
            <SpaceVisualCanvas
              layout={activeLayout}
              accentColor={accentColor}
              isPlaying={isPlaying}
              isRtl={isRtl}
              override={slideOverrides[currentSlide.id]}
            />
          )}

          {/* Proportional 1280x720 Slide Copy & Layout Layer */}
          {currentSlide && (
            isCompactMobile ? (
              <div
                key={`${currentSlide.id}-${safeIndex}-${activeLayout}-mobile`}
                className="relative h-full w-full overflow-y-auto"
              >
                <SlideRenderer
                  slide={currentSlide}
                  meta={presentation.presentation}
                  layout={activeLayout}
                  isRtl={isRtl}
                  isCompactMobile
                  slideNumber={
                    activeLayout === 'cover'
                      ? null
                      : slides
                          .slice(0, safeIndex + 1)
                          .filter((s, idx) => resolveSlideLayout(idx, s.layoutPreset) !== 'cover')
                          .length
                  }
                />
              </div>
            ) : (
              <div
                key={`${currentSlide.id}-${safeIndex}-${activeLayout}`}
                className="pointer-events-auto absolute left-1/2 top-1/2 overflow-hidden"
                style={{
                  width: 1280,
                  height: 720,
                  transform: `translate(-50%, -50%) scale(${stageScale})`,
                  transformOrigin: 'center center',
                }}
              >
                <SlideRenderer
                  slide={currentSlide}
                  meta={presentation.presentation}
                  layout={activeLayout}
                  isRtl={isRtl}
                  slideNumber={
                    activeLayout === 'cover'
                      ? null
                      : slides
                          .slice(0, safeIndex + 1)
                          .filter((s, idx) => resolveSlideLayout(idx, s.layoutPreset) !== 'cover')
                          .length
                  }
                />
              </div>
            )
          )}

          {/* Bottom-Left Discrete Pause / Play Control (exact match to inspiration plates) */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? 'Pause motion & timer (P)' : 'Resume motion & timer (P)'}
            aria-label={isPlaying ? 'Pause presentation' : 'Play presentation'}
            className="absolute bottom-4 start-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[rgba(18,18,24,0.74)] text-white/90 backdrop-blur-md transition-colors hover:border-[#FF9F55]/60 hover:text-white cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>

          {/* In-Slide Footer Attribution shown on every slide */}
          <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/55 px-3 py-1 font-mono text-[11px] tracking-wide text-white/65 backdrop-blur-xs">
            Generated by AI{aiTool.trim() ? ` · Tool: ${aiTool.trim()}` : ''}
          </div>

          {/* Subtle Bottom Progress Bar inside Stage */}
          <div
            className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/10"
            role="progressbar"
            aria-valuenow={safeIndex + 1}
            aria-valuemin={1}
            aria-valuemax={slides.length}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>
        </div>
      </main>

      {/* Quiet Editorial Control Bar Below Stage */}
      <footer className="z-30 flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs text-white/75 sm:px-6">
        {/* Left: Presentation Identity, Slide Counter & AI Attribution */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="truncate font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-accent)' }}
          >
            {presentation.presentation.title}
          </span>
          <span className="text-white/30" aria-hidden="true">
            ·
          </span>
          <span className="font-mono tabular-nums text-white/80 whitespace-nowrap">
            {String(safeIndex + 1).padStart(2, '0')} /{' '}
            {String(slides.length).padStart(2, '0')}
          </span>
          <span className="hidden md:inline text-white/30" aria-hidden="true">
            ·
          </span>
          <span className="hidden md:inline truncate text-white/50">
            {currentSlide?.type}
          </span>
          <span className="hidden sm:inline text-white/30" aria-hidden="true">
            ·
          </span>
          <span className="truncate text-white/50">
            Generated by AI{aiTool.trim() ? ` · Tool: ${aiTool.trim()}` : ''}
          </span>
        </div>

        {/* Center: Slide Dots + Prev/Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex === 0}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white transition-colors hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRtl ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-1">
            {slides.map((s, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={`${s.id}-${idx}`}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    active ? 'w-6' : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                  style={
                    active ? { backgroundColor: 'var(--color-accent)' } : undefined
                  }
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={safeIndex === slides.length - 1 && !autoAdvance}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white transition-colors hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRtl ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Right: Auto-Advance, Notes, RTL, Upload Studio, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setAutoAdvance((a) => !a)}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              autoAdvance
                ? 'border-[#FF9F55]/60 bg-[#FF9F55]/15 text-[#FF9F55]'
                : 'border-white/12 bg-white/5 text-white/70 hover:text-white'
            }`}
            title="Auto-advance slides using JSON duree_secondes"
          >
            Auto-Pitch
          </button>

          <button
            type="button"
            onClick={() => setIsNotesOpen((n) => !n)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isNotesOpen
                ? 'border-[#FF9F55]/60 bg-[#FF9F55]/15 text-[#FF9F55]'
                : 'border-white/12 bg-white/5 text-white/75 hover:text-white'
            }`}
            title="Speaker Notes & Pitch Timer (N)"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRtl((r) => !r)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isRtl
                ? 'border-[#FF9F55]/60 bg-[#FF9F55]/15 text-[#FF9F55]'
                : 'border-white/12 bg-white/5 text-white/75 hover:text-white'
            }`}
            title="Toggle RTL / LTR (R)"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{isRtl ? 'RTL' : 'LTR'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FF9F55] hover:bg-[#FF9F55] hover:text-black cursor-pointer whitespace-nowrap"
            title="Upload JSON & Inspiration Images (U)"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>JSON & Media</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title="Fullscreen (F)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/75 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </footer>

      {/* Speaker Notes & Pitch Countdown */}
      {currentSlide && (
        <SpeakerNotesOverlay
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          slide={currentSlide}
          slideIndex={safeIndex}
          totalSlides={slides.length}
          elapsedOnSlide={elapsedOnSlide}
          totalElapsed={totalElapsed}
          totalDeckDuration={totalDeckDuration}
        />
      )}

      {/* Upload JSON, Inspiration Plates & Design Tokens Drawer */}
      <StudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        presentation={presentation}
        currentSlideIndex={safeIndex}
        onUpdatePresentation={handleUpdatePresentation}
        onResetPresentation={handleResetPresentation}
        uploadedImages={uploadedImages}
        onAddUploadedImages={(items) =>
          setUploadedImages((prev) => [...items, ...prev])
        }
        onRemoveUploadedImage={(id) =>
          setUploadedImages((prev) => prev.filter((item) => item.id !== id))
        }
        slideOverrides={slideOverrides}
        onAssignSlideVisual={handleAssignSlideVisual}
        onChangeSlideLayout={handleChangeSlideLayout}
        accentColor={accentColor}
        onChangeAccentColor={setAccentColor}
        cardRadius={cardRadius}
        onChangeCardRadius={setCardRadius}
        isRtl={isRtl}
        onToggleRtl={() => setIsRtl((r) => !r)}
        aiTool={aiTool}
        onChangeAiTool={setAiTool}
      />
    </div>
  );
}
