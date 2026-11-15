import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  FileJson,
  ImagePlus,
  Languages,
  Layers,
  Palette,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  INSPIRATION_PLATES,
  LAYOUT_ROTATION,
} from '../data/defaultPresentation';
import {
  PresentationData,
  SlideLayoutKind,
  SlideVisualOverride,
  UploadedImageItem,
} from '../types/presentation';

interface StudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: PresentationData;
  currentSlideIndex: number;
  onUpdatePresentation: (next: PresentationData) => void;
  onResetPresentation: () => void;
  uploadedImages: UploadedImageItem[];
  onAddUploadedImages: (items: UploadedImageItem[]) => void;
  onRemoveUploadedImage: (id: string) => void;
  slideOverrides: Record<number, SlideVisualOverride>;
  onAssignSlideVisual: (slideId: number, override: SlideVisualOverride | null) => void;
  onChangeSlideLayout: (slideId: number, layout: SlideLayoutKind) => void;
  accentColor: string;
  onChangeAccentColor: (hex: string) => void;
  cardRadius: number;
  onChangeCardRadius: (px: number) => void;
  isRtl: boolean;
  onToggleRtl: () => void;
  aiTool: string;
  onChangeAiTool: (name: string) => void;
}

type StudioTab = 'json' | 'media' | 'tokens';

const ACCENT_PRESETS = [
  { name: 'Mars Orange', hex: '#FF9F55' },
  { name: 'Solar Amber', hex: '#FBBF24' },
  { name: 'Lunar Slate', hex: '#CBD5E1' },
  { name: 'Europa Cyan', hex: '#38BDF8' },
];

export const StudioDrawer: React.FC<StudioDrawerProps> = ({
  isOpen,
  onClose,
  presentation,
  currentSlideIndex,
  onUpdatePresentation,
  onResetPresentation,
  uploadedImages,
  onAddUploadedImages,
  onRemoveUploadedImage,
  slideOverrides,
  onAssignSlideVisual,
  onChangeSlideLayout,
  accentColor,
  onChangeAccentColor,
  cardRadius,
  onChangeCardRadius,
  isRtl,
  onToggleRtl,
  aiTool,
  onChangeAiTool,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('media');
  const [jsonDraft, setJsonDraft] = useState<string>(() =>
    JSON.stringify(presentation, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  const [isDraggingImg, setIsDraggingImg] = useState(false);

  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentSlide = presentation.slides[currentSlideIndex];
  const currentOverride = currentSlide ? slideOverrides[currentSlide.id] : undefined;
  const activeLayout: SlideLayoutKind =
    currentSlide?.layoutPreset ||
    LAYOUT_ROTATION[currentSlideIndex % LAYOUT_ROTATION.length];

  const handleJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setJsonDraft(text);
      try {
        const parsed = JSON.parse(text) as PresentationData;
        if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
          setJsonError('Invalid schema: JSON must include a non-empty "slides" array.');
          setJsonSuccess(null);
          return;
        }
        onUpdatePresentation(parsed);
        setJsonError(null);
        setJsonSuccess(`Loaded "${parsed.presentation?.title || 'Presentation'}" (${parsed.slides.length} slides).`);
      } catch {
        setJsonError('Syntax error: unable to parse JSON file.');
        setJsonSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyDraft = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as PresentationData;
      if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        setJsonError('Invalid schema: JSON must contain a non-empty "slides" array.');
        setJsonSuccess(null);
        return;
      }
      onUpdatePresentation(parsed);
      setJsonError(null);
      setJsonSuccess(`Applied ${parsed.slides.length} slides.`);
    } catch {
      setJsonError('Syntax error in JSON editor. Please verify brackets and quotes.');
      setJsonSuccess(null);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(presentation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || '');
        if (!src) return;
        const item: UploadedImageItem = {
          id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          src,
          source: 'upload',
        };
        onAddUploadedImages([item]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Presentation Content and Media Studio"
    >
      <div className="flex h-full w-full max-w-2xl flex-col border-s border-white/12 bg-[#0A0A0F] text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Presentation Studio
            </h2>
            <p className="text-xs text-white/60">
              Slide {currentSlideIndex + 1} of {presentation.slides.length} ·{' '}
              {currentSlide?.type}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15 cursor-pointer"
            aria-label="Close Studio"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-3">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-[#FF9F55] text-black'
                : 'bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Images & Layouts
          </button>
          <button
            type="button"
            onClick={() => {
              setJsonDraft(JSON.stringify(presentation, null, 2));
              setActiveTab('json');
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-[#FF9F55] text-black'
                : 'bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON Data Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tokens')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tokens'
                ? 'bg-[#FF9F55] text-black'
                : 'bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Design Tokens & RTL
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ==================== TAB 1: MEDIA & INSPIRATION ==================== */}
          {activeTab === 'media' && currentSlide && (
            <>
              {/* Current Slide Layout Selector */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
                    <Layers className="h-3.5 w-3.5 text-[#FF9F55]" />
                    Slide {currentSlideIndex + 1} Editorial Layout
                  </h3>
                  {currentOverride && (
                    <button
                      type="button"
                      onClick={() => onAssignSlideVisual(currentSlide.id, null)}
                      className="text-xs font-medium text-[#FF9F55] hover:underline cursor-pointer"
                    >
                      Restore Procedural Space Art
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LAYOUT_ROTATION.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onChangeSlideLayout(currentSlide.id, l)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        activeLayout === l
                          ? 'border-[#FF9F55] bg-[#FF9F55]/15 text-[#FF9F55]'
                          : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </section>

              {/* Active Image Scrim Controls (if custom image assigned) */}
              {currentOverride && (
                <section className="rounded-2xl border border-white/12 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Active backdrop: {currentOverride.imageName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAssignSlideVisual(currentSlide.id, null)}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:bg-white/20 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1 text-xs text-white/75">
                      <span>
                        Contrast Scrim ({Math.round(currentOverride.scrimOpacity * 100)}%)
                      </span>
                      <input
                        type="range"
                        min={0.2}
                        max={0.85}
                        step={0.05}
                        value={currentOverride.scrimOpacity}
                        onChange={(e) =>
                          onAssignSlideVisual(currentSlide.id, {
                            ...currentOverride,
                            scrimOpacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[#FF9F55]"
                      />
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-white/85 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentOverride.kenBurns}
                        onChange={(e) =>
                          onAssignSlideVisual(currentSlide.id, {
                            ...currentOverride,
                            kenBurns: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-[#FF9F55]"
                      />
                      <span>Subtle Ken Burns Zoom</span>
                    </label>
                  </div>
                </section>
              )}

              {/* Upload Custom Images Dropzone */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Upload Inspiration or Slide Visuals
                </h3>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImg(true);
                  }}
                  onDragLeave={() => setIsDraggingImg(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingImg(false);
                    handleImageFiles(e.dataTransfer.files);
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors ${
                    isDraggingImg
                      ? 'border-[#FF9F55] bg-[#FF9F55]/10'
                      : 'border-white/20 bg-white/[0.03]'
                  }`}
                >
                  <Upload className="mb-2 h-6 w-6 text-[#FF9F55]" />
                  <p className="text-sm font-medium text-white">
                    Drop PNG, JPG, or WEBP images here
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Assign any uploaded image as Slide {currentSlideIndex + 1} background
                  </p>
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#FF9F55] transition-colors cursor-pointer"
                  >
                    Choose Images
                  </button>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                </div>
              </section>

              {/* Uploaded Custom Images Grid */}
              {uploadedImages.length > 0 && (
                <section className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Uploaded Media ({uploadedImages.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((img) => {
                      const isAssigned = currentOverride?.imageSrc === img.src;
                      return (
                        <div
                          key={img.id}
                          className="group overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03]"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-black">
                            <img
                              src={img.src}
                              alt={img.name}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveUploadedImage(img.id)}
                              className="absolute end-2 top-2 rounded-lg bg-black/75 p-1.5 text-white/80 hover:text-rose-400 cursor-pointer"
                              aria-label={`Remove ${img.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2.5">
                            <span className="truncate text-xs text-white/80">
                              {img.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onAssignSlideVisual(currentSlide.id, {
                                  imageSrc: img.src,
                                  imageName: img.name,
                                  scrimOpacity: 0.45,
                                  kenBurns: true,
                                })
                              }
                              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                                isAssigned
                                  ? 'bg-[#FF9F55] text-black'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {isAssigned ? 'Active' : 'Use'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Declared Inspiration Plates from User Attachments */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Inspiration Reference Plates (7 Attached Designs)
                </h3>
                <p className="text-xs text-white/60">
                  Visual direction source plates loaded from workspace assets. Apply a layout directly or blend as a reference layer.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {INSPIRATION_PLATES.map((plate) => (
                    <div
                      key={plate.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={plate.src}
                          alt={plate.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="text-xs font-bold text-[#FF9F55]">
                          {plate.label}
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/65">
                          {plate.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              onChangeSlideLayout(currentSlide.id, plate.layout)
                            }
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                              activeLayout === plate.layout
                                ? 'bg-[#FF9F55] text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            Apply Layout
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAssignSlideVisual(currentSlide.id, {
                                imageSrc: plate.src,
                                imageName: plate.label,
                                scrimOpacity: 0.6,
                                kenBurns: true,
                              })
                            }
                            className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/15 cursor-pointer"
                          >
                            Use Plate Backdrop
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ==================== TAB 2: JSON UPLOAD & SCHEMA ==================== */}
          {activeTab === 'json' && (
            <>
              <section
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingJson(true);
                }}
                onDragLeave={() => setIsDraggingJson(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingJson(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleJsonFile(file);
                }}
                className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors ${
                  isDraggingJson
                    ? 'border-[#FF9F55] bg-[#FF9F55]/10'
                    : 'border-white/20 bg-white/[0.03]'
                }`}
              >
                <FileJson className="mb-2 h-6 w-6 text-[#FF9F55]" />
                <p className="text-sm font-medium text-white">
                  Upload a <span className="font-mono text-[#FF9F55]">data.json</span> presentation file
                </p>
                <p className="mt-1 text-xs text-white/55">
                  Drag & drop or select any JSON following the Operation Red Rock slide schema
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => jsonInputRef.current?.click()}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#FF9F55] transition-colors cursor-pointer"
                  >
                    Upload JSON File
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetPresentation();
                      setJsonError(null);
                      setJsonSuccess('Restored default Operation Red Rock presentation.');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Default
                  </button>
                </div>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleJsonFile(file);
                  }}
                />
              </section>

              {jsonError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-xs text-rose-200">
                  {jsonError}
                </div>
              )}
              {jsonSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-xs text-emerald-200">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{jsonSuccess}</span>
                </div>
              )}

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="json-editor"
                    className="text-xs font-bold uppercase tracking-wider text-white/80"
                  >
                    Live JSON Content Editor
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyDraft}
                    className="rounded-lg bg-[#FF9F55] px-3.5 py-1.5 text-xs font-bold text-black hover:opacity-90 cursor-pointer"
                  >
                    Apply JSON Changes
                  </button>
                </div>
                <textarea
                  id="json-editor"
                  value={jsonDraft}
                  onChange={(e) => setJsonDraft(e.target.value)}
                  spellCheck={false}
                  rows={14}
                  className="w-full rounded-2xl border border-white/15 bg-black/80 p-4 font-mono text-xs leading-relaxed text-white/90 focus:border-[#FF9F55] focus:outline-none"
                />
              </section>
            </>
          )}

          {/* ==================== TAB 3: CSS VARIABLES & RTL ==================== */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Single Accent Token (--color-accent)
                </h3>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => onChangeAccentColor(preset.hex)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold cursor-pointer ${
                        accentColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-white bg-white/12 text-white'
                          : 'border-white/12 bg-white/5 text-white/75 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 pt-1 text-xs text-white/80">
                  <span>Custom Hex:</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => onChangeAccentColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded bg-transparent"
                  />
                  <span className="font-mono uppercase">{accentColor}</span>
                </label>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Card Radius (--radius-card: {cardRadius}px)
                </h3>
                <input
                  type="range"
                  min={12}
                  max={32}
                  step={2}
                  value={cardRadius}
                  onChange={(e) => onChangeCardRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FF9F55]"
                />
              </section>

              <section className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
                  <Languages className="h-3.5 w-3.5 text-[#FF9F55]" />
                  Reading Direction (LTR / RTL Support)
                </h3>
                <p className="text-xs text-white/60">
                  Mirrors slide layouts, typography alignment, and directional controls for Arabic, Hebrew, or Persian presentations.
                </p>
                <div className="inline-flex rounded-xl border border-white/12 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => isRtl && onToggleRtl()}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer ${
                      !isRtl ? 'bg-white text-black' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    LTR (Left-to-Right)
                  </button>
                  <button
                    type="button"
                    onClick={() => !isRtl && onToggleRtl()}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer ${
                      isRtl ? 'bg-white text-black' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    RTL (Right-to-Left)
                  </button>
                </div>
              </section>

              <section className="space-y-2.5">
                <label
                  htmlFor="ai-tool-name"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Footer AI Attribution Tool Name
                </label>
                <p className="text-xs text-white/60">
                  Displayed in the presentation footer alongside the AI generation disclosure (or set <span className="font-mono text-white/80">presentation.aiTool</span> in <span className="font-mono text-white/80">data.json</span>).
                </p>
                <input
                  id="ai-tool-name"
                  type="text"
                  value={aiTool}
                  onChange={(e) => onChangeAiTool(e.target.value)}
                  placeholder="Enter AI tool name..."
                  className="w-full rounded-xl border border-white/15 bg-black/70 px-3.5 py-2.5 text-xs text-white placeholder:text-white/35 focus:border-[#FF9F55] focus:outline-none"
                />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
