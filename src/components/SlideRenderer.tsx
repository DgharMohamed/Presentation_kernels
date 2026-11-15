import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import {
  PresentationMeta,
  SlideData,
  SlideLayoutKind,
} from '../types/presentation';

const DEMO_URL = 'https://red-rock-gamma.vercel.app/';

interface SlideRendererProps {
  slide: SlideData;
  meta: PresentationMeta;
  layout: SlideLayoutKind;
  isRtl: boolean;
  slideNumber?: number | null;
  isCompactMobile?: boolean;
}

/** Splits "Label: Value" into bold label + regular body, matching editorial spec */
function renderLabeledLine(text: string): React.ReactNode {
  const colonIndex = text.indexOf(':');
  if (colonIndex > 0 && colonIndex < 40) {
    const label = text.slice(0, colonIndex + 1);
    const rest = text.slice(colonIndex + 1);
    return (
      <>
        <strong className="font-bold">{label}</strong>
        <span className="font-normal">{rest}</span>
      </>
    );
  }
  return <span className="font-normal">{text}</span>;
}

/** Real scannable QR SVG encoding https://red-rock-gamma.vercel.app/ */
const MissionQrSvg: React.FC<{ url: string }> = ({ url }) => {
  const { size, modules } = useMemo(() => {
    const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
    return {
      size: qr.modules.size,
      modules: Array.from(qr.modules.data),
    };
  }, [url]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-36 w-36 sm:h-40 sm:w-40"
      aria-label={`QR code linking to ${url}`}
    >
      <rect width={size} height={size} fill="#FFFFFF" />
      {modules.map((val, idx) => {
        if (!val) return null;
        const r = Math.floor(idx / size);
        const c = idx % size;
        return (
          <rect key={idx} x={c} y={r} width={1} height={1} fill="#1A1A1A" />
        );
      })}
    </svg>
  );
};

const QUIZ_OPTIONS = [
  { id: 'atacama', label: 'Atacama Desert, Chile', correct: true },
  { id: 'mauna', label: 'Mauna Loa, Hawaii', correct: false },
  { id: 'devon', label: 'Devon Island, Canada', correct: false },
  { id: 'mojave', label: 'Mojave Desert, USA', correct: false },
];

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  meta,
  layout,
  isRtl,
  slideNumber,
  isCompactMobile = false,
}) => {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [gravityMode, setGravityMode] = useState<'earth' | 'mars'>('mars');

  const bullets = slide['bullet-points'] || [];
  const mainMessage = slide.contenu?.message_principal || '';
  const subTitle = slide['sub-title'] || '';

  const numberedHeader =
    slideNumber != null
      ? `${String(slideNumber).padStart(2, '0')}-${(slide.type || slide.title).trim()}`
      : null;

  const coverTitle = slide.title.includes('—')
    ? slide.title.split('—').slice(1).join('—').trim()
    : slide.title;

  const coverBadge = [meta.team, meta.event].filter(Boolean).join(' · ') || slide.type;

  const stagePadStyle: React.CSSProperties = isCompactMobile
    ? { paddingInline: '1.25rem', paddingBlock: '1.25rem' }
    : { paddingInline: '64px', paddingBlock: '44px' };

  // =========================================================================
  // 1. COVER LAYOUT (Page de garde — NASA Space Apps logo + Challenge name)
  // =========================================================================
  if (layout === 'cover') {
    const challengeName =
      subTitle ||
      'Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars';

    return (
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between"
        style={stagePadStyle}
      >
        {/* Top-Right Coherent NASA Space Apps Challenge Logo */}
        {meta.logoSrc && (
          <div
            className={`reveal-item reveal-delay-1 flex items-center gap-3 ${
              isRtl ? 'self-start' : 'self-end'
            }`}
          >
            <div className="relative h-[96px] w-[176px] overflow-hidden rounded-2xl border border-white/18 bg-[#05153D]/85 shadow-[0_0_28px_rgba(255,159,85,0.14)]">
              <img
                src={meta.logoSrc}
                alt="NASA Space Apps Challenge Logo"
                referrerPolicy="no-referrer"
                className="h-full w-full scale-[1.12] object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom-Right Main Title Block */}
        <div
          className={`flex max-w-[660px] flex-col gap-3 ${
            isRtl ? 'self-start items-start text-start' : 'self-end items-end text-end'
          }`}
        >
          <h1
            className="editorial-title reveal-item reveal-delay-1"
            style={{ fontSize: isCompactMobile ? '2.1rem' : '62px' }}
          >
            {coverTitle}
          </h1>

          <div className="editorial-badge reveal-item reveal-delay-2 inline-flex items-center px-7 py-2">
            <span
              className="font-extrabold uppercase tracking-[0.08em]"
              style={{ fontSize: isCompactMobile ? '0.8rem' : '16.5px' }}
            >
              {coverBadge}
            </span>
          </div>

          <p
            className="reveal-item reveal-delay-3 max-w-[620px] font-medium leading-[1.38] text-white/95"
            style={{ fontSize: isCompactMobile ? '0.85rem' : '16.5px' }}
          >
            {challengeName}
          </p>

          <p
            className="editorial-tagline reveal-item reveal-delay-3"
            style={{ fontSize: isCompactMobile ? '0.75rem' : '13.5px' }}
          >
            {mainMessage}
          </p>

          {bullets.length > 0 && (
            <div
              className="reveal-item reveal-delay-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-white/75"
              style={{ fontSize: isCompactMobile ? '0.75rem' : '13.5px' }}
            >
              {bullets.slice(0, 3).map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <span>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. OBJECTIVES / SPLIT LAYOUT (Slide 2: 01-Problem Statement)
  // =========================================================================
  if (layout === 'objectives') {
    return (
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between"
        style={stagePadStyle}
      >
        <div className={`${isCompactMobile ? 'w-full' : 'w-[620px]'} text-start`}>
          {numberedHeader && (
            <p className="editorial-tagline reveal-item reveal-delay-1 mb-2 font-mono text-[14px] tabular-nums">
              {numberedHeader}
            </p>
          )}
          <h2
            className="editorial-title reveal-item reveal-delay-1 mb-5"
            style={{ fontSize: isCompactMobile ? '1.6rem' : '44px' }}
          >
            {slide.title}
          </h2>

          {mainMessage && (
            <p
              className="reveal-item reveal-delay-2 mb-6 font-medium leading-[1.45] text-white"
              style={{ fontSize: isCompactMobile ? '0.95rem' : '21px' }}
            >
              {mainMessage}
            </p>
          )}

          <div className="space-y-4">
            {bullets.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className={`editorial-card reveal-item reveal-delay-${Math.min(5, idx + 2)} px-6 py-3.5 leading-[1.42]`}
                style={{ fontSize: isCompactMobile ? '0.85rem' : '16.5px' }}
              >
                {renderLabeledLine(item)}
              </div>
            ))}
          </div>
        </div>

        {slide.visualCredit && (
          <p className="reveal-item reveal-delay-5 max-w-[540px] text-[12px] tracking-wide text-white/50 text-start">
            {slide.visualCredit}
          </p>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. NARRATIVE + HORIZON LAYOUT (Slide 3: 02-Solution Overview)
  // =========================================================================
  if (layout === 'narrative') {
    return (
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between"
        style={stagePadStyle}
      >
        <div className="w-full space-y-5 text-start">
          <div>
            {numberedHeader && (
              <p className="editorial-tagline reveal-item reveal-delay-1 mb-1.5 font-mono text-[14px] tabular-nums">
                {numberedHeader}
              </p>
            )}
            <h2
              className="editorial-title reveal-item reveal-delay-1 mb-2.5"
              style={{ fontSize: isCompactMobile ? '1.55rem' : '42px' }}
            >
              {slide.title}
            </h2>
            <p
              className="reveal-item reveal-delay-2 max-w-[900px] leading-[1.45] text-white/95"
              style={{ fontSize: isCompactMobile ? '0.92rem' : '19.5px' }}
            >
              {mainMessage || subTitle}
            </p>
          </div>

          <div>
            <h3
              className="editorial-subtitle reveal-item reveal-delay-2 mb-4"
              style={{ fontSize: isCompactMobile ? '1.05rem' : '21px' }}
            >
              {subTitle || slide.type}
            </h3>

            <div
              className={`grid gap-4 ${
                isCompactMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {bullets.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className={`editorial-card reveal-item reveal-delay-${Math.min(5, idx + 2)} flex items-start gap-3.5 px-6 py-4 leading-[1.42]`}
                  style={{ fontSize: isCompactMobile ? '0.85rem' : '16.5px' }}
                >
                  <span className="mt-0.5 font-mono text-[15px] font-extrabold tabular-nums text-[#1A1A1A]/60">
                    0{idx + 1}
                  </span>
                  <span>{renderLabeledLine(item)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {slide.visualCredit && (
          <p className="reveal-item reveal-delay-5 text-[12px] tracking-wide text-white/65 text-start">
            {slide.visualCredit}
          </p>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. SPECS / EXPLORER SHOWCASE (Slide 5: 04-Explorer with dual screenshots)
  // =========================================================================
  if (layout === 'specs') {
    const isExplorerDemo =
      slide.title.toLowerCase().includes('analog') ||
      slide.type.toLowerCase().includes('explorer');
    const firstBlock = bullets.slice(0, 2);
    const secondBlock = bullets.slice(2, 4);
    const galleryImages = slide.galleryImages || [];
    const hasGallery = galleryImages.length > 0;

    return (
      <div
        className="relative z-10 flex h-full w-full flex-col justify-center"
        style={stagePadStyle}
      >
        <div
          className={`flex w-full items-center justify-between gap-7 ${
            isCompactMobile ? 'flex-col' : 'flex-row'
          }`}
        >
          {/* Left Specs & Description Column */}
          <div
            className={`${
              isCompactMobile ? 'w-full' : hasGallery ? 'w-[630px]' : 'w-[630px]'
            } space-y-3.5 text-start`}
          >
            <div>
              {numberedHeader && (
                <p className="editorial-tagline reveal-item reveal-delay-1 mb-1 font-mono text-[13.5px] tabular-nums">
                  {numberedHeader}
                </p>
              )}
              <h2
                className="editorial-subtitle reveal-item reveal-delay-1 mb-2"
                style={{ fontSize: isCompactMobile ? '1.2rem' : '24px' }}
              >
                {slide.title}
              </h2>
              {(slide.description || mainMessage) && (
                <p
                  className="reveal-item reveal-delay-2 mb-3 leading-[1.42] text-white/90"
                  style={{ fontSize: isCompactMobile ? '0.84rem' : '15.5px' }}
                >
                  {slide.description || mainMessage}
                </p>
              )}
              <div className="editorial-card reveal-item reveal-delay-2 p-5">
                {isExplorerDemo && (
                  <div className="mb-3 space-y-1.5 border-b border-black/10 pb-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <span className="text-[12px] font-bold uppercase tracking-wider text-black/65">
                          Olympus Mons (Mars)
                        </span>
                        <span className="ms-2 font-mono text-[19px] font-bold tabular-nums text-[#1A1A1A]">
                          22 km
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] font-bold uppercase tracking-wider text-black/65">
                          Mauna Loa (Earth)
                        </span>
                        <span className="ms-2 font-mono text-[19px] font-bold tabular-nums text-[#1A1A1A]">
                          4.2 km
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 pt-0.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                        <div className="h-full w-full rounded-full bg-[#1A1A1A]" />
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                        <div className="h-full w-[19%] rounded-full bg-[#1A1A1A]/65" />
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="space-y-1.5 leading-[1.42]"
                  style={{ fontSize: isCompactMobile ? '0.82rem' : '15px' }}
                >
                  {firstBlock.map((b, idx) => (
                    <p key={idx}>{renderLabeledLine(b)}</p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3
                className="editorial-subtitle reveal-item reveal-delay-3 mb-2"
                style={{ fontSize: isCompactMobile ? '1.05rem' : '19px' }}
              >
                {subTitle || 'SCIENTIFIC PROFILES & NASA SOURCES'}
              </h3>
              <div className="editorial-card reveal-item reveal-delay-4 p-5">
                <div
                  className="space-y-1.5 leading-[1.42]"
                  style={{ fontSize: isCompactMobile ? '0.82rem' : '15px' }}
                >
                  {(secondBlock.length > 0 ? secondBlock : [mainMessage]).map(
                    (b, idx) => (
                      <p key={idx}>{renderLabeledLine(b)}</p>
                    )
                  )}
                </div>
                {isExplorerDemo && (
                  <p className="mt-2.5 font-mono text-[11.5px] font-semibold text-black/65">
                    NASA Catalogs: PIA12461 · ISS015-E-7852
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Stacked Explorer Screenshots + Captions */}
          {hasGallery && (
            <div
              className={`${
                isCompactMobile ? 'w-full' : 'w-[468px]'
              } flex flex-col gap-3.5 text-start`}
            >
              {galleryImages.slice(0, 2).map((img, idx) => (
                <figure
                  key={idx}
                  className={`reveal-item reveal-delay-${idx + 2} overflow-hidden rounded-2xl border border-white/18 bg-black/85 backdrop-blur-md`}
                >
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={img.src}
                      alt={img.caption}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <figcaption className="border-t border-white/10 px-4 py-2 text-[11.5px] font-medium text-white/85">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. INFO GRID: INTRO LEFT + 4 STACKED CARDS RIGHT (Slide 5: 04-Learning)
  // =========================================================================
  if (layout === 'grid') {
    const isQuizSlide =
      slide.type.toLowerCase().includes('learning') ||
      (slide['visual-idea'] || '').toLowerCase().includes('quiz') ||
      (slide['visual-idea'] || '').includes('60 °C');

    return (
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between"
        style={stagePadStyle}
      >
        <div className="text-start">
          {numberedHeader && (
            <p className="editorial-tagline reveal-item reveal-delay-1 mb-1.5 font-mono text-[14px] tabular-nums">
              {numberedHeader}
            </p>
          )}
          <h2
            className="editorial-title reveal-item reveal-delay-1"
            style={{ fontSize: isCompactMobile ? '1.55rem' : '42px' }}
          >
            {slide.title}
          </h2>
        </div>

        <div
          className={`mt-5 grid flex-1 items-center gap-8 ${
            isCompactMobile ? 'grid-cols-1' : 'grid-cols-12'
          }`}
        >
          {/* Left Intro + Interactive Challenge Sample */}
          <div className={`${isCompactMobile ? '' : 'col-span-5'} space-y-5 text-start`}>
            <p
              className="reveal-item reveal-delay-2 leading-[1.48] text-white/95"
              style={{ fontSize: isCompactMobile ? '0.9rem' : '18.5px' }}
            >
              {mainMessage || subTitle}
            </p>

            {isQuizSlide && (
              <div className="reveal-item reveal-delay-3 rounded-2xl border border-white/15 bg-black/65 p-5 backdrop-blur-md">
                <p
                  className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Sample Challenge · Active Recall
                </p>
                <p className="mb-3.5 text-[15px] font-medium leading-snug text-white">
                  −60 °C mean temp, &lt;10 mm rainfall/year: Which Earth site is
                  the hyper-arid Mars analog?
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {QUIZ_OPTIONS.map((opt) => {
                    const isPicked = selectedQuiz === opt.id;
                    const showResult = selectedQuiz !== null;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedQuiz(opt.id)}
                        className={`rounded-xl border px-3.5 py-2.5 text-start text-[13.5px] font-medium transition-colors cursor-pointer ${
                          showResult && opt.correct
                            ? 'border-emerald-400/80 bg-emerald-500/20 text-white'
                            : isPicked && !opt.correct
                            ? 'border-rose-400/80 bg-rose-500/20 text-white'
                            : 'border-white/15 bg-white/8 text-white/90 hover:bg-white/15'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {selectedQuiz && (
                  <p className="mt-3 text-[12.5px] leading-relaxed text-white/85">
                    {QUIZ_OPTIONS.find((o) => o.id === selectedQuiz)?.correct
                      ? 'Verified: Atacama hyper-arid soils mirror Martian regolith chemistry and moisture scarcity.'
                      : 'Compare moisture: Atacama receives <10 mm/yr, closest to Mars hyper-arid conditions.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right 4 Stacked Gray Cards */}
          <div className={`${isCompactMobile ? '' : 'col-span-7'} flex flex-col gap-3.5`}>
            {bullets.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className={`editorial-card reveal-item reveal-delay-${Math.min(5, idx + 1)} px-7 py-4.5 text-start leading-[1.42]`}
                style={{ fontSize: isCompactMobile ? '0.85rem' : '16.5px' }}
              >
                {renderLabeledLine(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. LIST CARD OVER PANORAMIC LANDSCAPE (Slide 6: 05-3D Simulation)
  // =========================================================================
  if (layout === 'list') {
    const isSimulationSlide =
      slide.title.toLowerCase().includes('drive') ||
      slide.type.toLowerCase().includes('simulation') ||
      bullets.some((b) => b.toLowerCase().includes('rovers'));

    const telemetry =
      gravityMode === 'mars'
        ? {
            gravity: '3.72 m/s²',
            windSpeed: '28 m/s',
            meteo: 'Dust Storm',
            symmetry: '44%',
          }
        : {
            gravity: '9.81 m/s²',
            windSpeed: '12 m/s',
            meteo: 'Clear Sky',
            symmetry: '100%',
          };

    return (
      <div
        className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6"
        style={stagePadStyle}
      >
        <div className="w-full max-w-[1090px] text-center">
          {numberedHeader && (
            <p className="editorial-tagline reveal-item reveal-delay-1 mb-1.5 font-mono text-[14px] tabular-nums">
              {numberedHeader}
            </p>
          )}
          <h2
            className="editorial-title reveal-item reveal-delay-1 mx-auto"
            style={{ fontSize: isCompactMobile ? '1.55rem' : '42px' }}
          >
            {slide.title}
          </h2>
        </div>

        <div
          className={`flex w-full max-w-[1090px] items-center justify-center gap-8 ${
            isCompactMobile ? 'flex-col' : 'flex-row'
          }`}
        >
          <div
            className={`editorial-card reveal-item reveal-delay-2 p-7 text-start ${
              isCompactMobile ? 'w-full' : 'w-[620px]'
            }`}
          >
            <p
              className="mb-4 font-medium leading-[1.45]"
              style={{ fontSize: isCompactMobile ? '0.9rem' : '18px' }}
            >
              {mainMessage || subTitle}
            </p>
            <ul
              className="space-y-3 leading-[1.45]"
              style={{ fontSize: isCompactMobile ? '0.84rem' : '16.5px' }}
            >
              {bullets.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1A1A1A]"
                  />
                  <span>{renderLabeledLine(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          {isSimulationSlide && (
            <div
              className={`reveal-item reveal-delay-3 rounded-2xl border border-white/15 bg-black/78 p-5 backdrop-blur-md text-start ${
                isCompactMobile ? 'w-full' : 'w-[410px]'
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span
                  className="font-mono text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Live Gravity Telemetry
                </span>
                <div className="inline-flex rounded-lg bg-white/10 p-0.5 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setGravityMode('earth')}
                    className={`rounded-md px-3 py-1 font-semibold transition-colors cursor-pointer ${
                      gravityMode === 'earth'
                        ? 'bg-white text-black'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    Earth
                  </button>
                  <button
                    type="button"
                    onClick={() => setGravityMode('mars')}
                    className={`rounded-md px-3 py-1 font-semibold transition-colors cursor-pointer ${
                      gravityMode === 'mars'
                        ? 'bg-white text-black'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    Mars
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono tabular-nums">
                <div>
                  <div className="text-[11px] uppercase text-white/55">Gravity</div>
                  <div className="text-[20px] font-bold text-white">{telemetry.gravity}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase text-white/55">Wind Speed</div>
                  <div className="text-[20px] font-bold text-white">{telemetry.windSpeed}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase text-white/55">Meteo</div>
                  <div className="text-[19px] font-bold text-white">{telemetry.meteo}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase text-white/55">Symmetry</div>
                  <div className="text-[20px] font-bold text-white">{telemetry.symmetry}</div>
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-mono uppercase text-white/60">
                  <span>Symmetry</span>
                  <span>{telemetry.symmetry}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: telemetry.symmetry,
                      backgroundColor: 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. ACTIVITY / PERSPECTIVES (Slide 7: 06-Perspectives)
  // =========================================================================
  return (
    <div
      className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-7"
      style={stagePadStyle}
    >
      <div className="w-full max-w-[1060px] text-center">
        {numberedHeader && (
          <p className="editorial-tagline reveal-item reveal-delay-1 mb-1.5 font-mono text-[14px] tabular-nums">
            {numberedHeader}
          </p>
        )}
        <h2
          className="editorial-title reveal-item reveal-delay-1 mx-auto"
          style={{ fontSize: isCompactMobile ? '1.55rem' : '44px' }}
        >
          {slide.title}
        </h2>
      </div>

      <div
        className={`flex w-full max-w-[1060px] items-center justify-center gap-10 ${
          isCompactMobile ? 'flex-col' : 'flex-row'
        }`}
      >
        <div
          className={`editorial-card reveal-item reveal-delay-2 p-7 text-start ${
            isCompactMobile ? 'w-full' : 'w-[580px]'
          }`}
        >
          <ul
            className="space-y-4 font-medium leading-[1.45]"
            style={{ fontSize: isCompactMobile ? '0.9rem' : '18.5px' }}
          >
            {bullets.slice(0, 5).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#1A1A1A]"
                />
                <span>{renderLabeledLine(item)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Large Interactive QR Button linking directly to https://red-rock-gamma.vercel.app/ */}
        <a
          href={DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="reveal-item reveal-delay-4 group flex flex-col items-center gap-3.5 rounded-3xl border border-white/20 bg-black/82 p-5 text-center backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF9F55] hover:bg-black/92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9F55]"
          aria-label={`Launch ${meta.title || 'Operation Red Rock'} live app at ${DEMO_URL}`}
        >
          <div className="overflow-hidden rounded-2xl bg-white p-3">
            <MissionQrSvg url={DEMO_URL} />
          </div>

          <div className="space-y-1.5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-black transition-transform group-hover:scale-[1.03]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <span>Launch Live App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
            <div className="font-mono text-[12.5px] font-medium text-white/90">
              red-rock-gamma.vercel.app
            </div>
            <div className="text-[11px] text-white/55">
              {slide.visualCredit || 'Open NASA / USGS Data'}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
