export type SlideLayoutKind =
  | 'cover'
  | 'objectives'
  | 'narrative'
  | 'specs'
  | 'grid'
  | 'list'
  | 'activity';

export interface SlideContenu {
  message_principal?: string;
  note_speaker?: string;
  layout?: string;
  duree_secondes?: number;
  roadmap?: string[];
  call_to_action?: string[];
}

export interface SlideGalleryImage {
  src: string;
  caption: string;
}

export interface SlideData {
  id: number;
  type: string;
  title: string;
  'sub-title'?: string;
  description?: string;
  contenu: SlideContenu;
  'visual-idea'?: string;
  'bullet-points': string[];
  /** Optional explicit layout override for custom JSON decks */
  layoutPreset?: SlideLayoutKind;
  /** Optional suggested photographic source credit */
  visualCredit?: string;
  /** Optional embedded showcase screenshots */
  galleryImages?: SlideGalleryImage[];
}

export interface PresentationMeta {
  title: string;
  team?: string;
  event?: string;
  format?: string;
  total_duration_seconds?: number;
  direction?: 'ltr' | 'rtl';
  accentColor?: string;
  aiTool?: string;
  logoSrc?: string;
}

export interface PresentationData {
  presentation: PresentationMeta;
  slides: SlideData[];
}

export interface InspirationPlate {
  id: string;
  layout: SlideLayoutKind;
  label: string;
  description: string;
  src: string;
}

export interface UploadedImageItem {
  id: string;
  name: string;
  src: string;
  source: 'inspiration' | 'upload';
  assignedSlideId?: number | null;
}

export interface SlideVisualOverride {
  imageSrc: string;
  imageName: string;
  scrimOpacity: number; // 0.25 to 0.85
  kenBurns: boolean;
}
