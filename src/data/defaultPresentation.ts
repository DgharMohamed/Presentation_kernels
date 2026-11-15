import { InspirationPlate, PresentationData, SlideLayoutKind } from '../types/presentation';

export const INSPIRATION_PLATES: InspirationPlate[] = [
  {
    id: 'insp-1-cover',
    layout: 'cover',
    label: '01. Cover — Planet & Capsule Title',
    description: 'Full-frame cosmic sphere left, oversized orange display title + white pill badge + tracked tagline bottom-right.',
    src: '/assets/aistudio/Capture_08e3809c.PNG',
  },
  {
    id: 'insp-2-objectives',
    layout: 'objectives',
    label: '02. Objectives — Cropped Rim Planet',
    description: 'Left editorial text column (~45%) paired with a giant glowing planetary limb cropped along the right edge.',
    src: '/assets/aistudio/2PNG_1a068464.PNG',
  },
  {
    id: 'insp-3-narrative',
    layout: 'narrative',
    label: '03. Narrative — Top Copy & Horizon Glow',
    description: 'Two structured narrative blocks at the top above a luminous planetary horizon fading smoothly into deep black.',
    src: '/assets/aistudio/3_2ff7f602.PNG',
  },
  {
    id: 'insp-4-specs',
    layout: 'specs',
    label: '04. Specs — Dual Gray Cards & 3D Globe',
    description: 'Two translucent gray 24px-radius data cards on the left beneath orange headers, balanced by a half-lit sphere on the right.',
    src: '/assets/aistudio/4_f969b658.PNG',
  },
  {
    id: 'insp-5-grid',
    layout: 'grid',
    label: '05. Info Grid — 4 Stacked Cards & Ridge',
    description: 'Intro text on the left, four stacked gray rounded cards on the right, rocky mountain terrain faded at the bottom.',
    src: '/assets/aistudio/6_b2188602.PNG',
  },
  {
    id: 'insp-6-list',
    layout: 'list',
    label: '06. List — Single Card Over Landscape',
    description: 'One generous translucent gray card anchored on the left over a panoramic valley landscape fading upward into black.',
    src: '/assets/aistudio/7_635b7330.PNG',
  },
  {
    id: 'insp-7-activity',
    layout: 'activity',
    label: '07. Activity — Spaced Brief & Silhouette',
    description: 'Spaced bold-label items on the left paired with a rover/explorer silhouette in front of a glowing red-orange disk.',
    src: '/assets/aistudio/8_2353734c.PNG',
  },
];

export const LAYOUT_ROTATION: SlideLayoutKind[] = [
  'cover',
  'objectives',
  'narrative',
  'specs',
  'grid',
  'list',
  'activity',
];

export function resolveSlideLayout(slideIndex: number, layoutPreset?: SlideLayoutKind): SlideLayoutKind {
  if (layoutPreset) return layoutPreset;
  return LAYOUT_ROTATION[slideIndex % LAYOUT_ROTATION.length];
}

export const DEFAULT_PRESENTATION: PresentationData = {
  presentation: {
    title: 'OPERATION RED ROCK',
    team: 'KERNELS',
    event: 'NASA Space Apps Challenge 2026',
    format: 'Pitch de 3 minutes',
    total_duration_seconds: 200,
    direction: 'ltr',
    accentColor: '#FF9F55',
    aiTool: 'IA studio tools',
    logoSrc: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_13.54.56_601ac94b.jpeg',
  },
  slides: [
    {
      id: 1,
      type: 'Introduction / Hook',
      title: 'KERNELS presents — OPERATION RED ROCK',
      'sub-title':
        'Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars',
      contenu: {
        message_principal:
          "We don't just describe planetary analogs. We make them explorable.",
        note_speaker:
          "Présenter rapidement l'équipe et le challenge. Introduire l'idée centrale : notre projet transforme l'étude des analogues planétaires en une expérience interactive. Ne pas dépasser 15 secondes.",
        layout:
          'Full-screen cinematic cover : grande image en arrière-plan, titre au centre, logo et nom du challenge en bas.',
        duree_secondes: 15,
      },
      'visual-idea':
        "Image NASA du cratère Gale fusionnant avec une photographie du désert d'Atacama. Logo NASA Space Apps Challenge en haut à droite.",
      visualCredit: 'NASA / JPL-Caltech Gale Crater · Atacama Analog Composite',
      layoutPreset: 'cover',
      'bullet-points': [
        'Team KERNELS',
        'Explore Earth locations that resemble Mars and the Moon.',
        'Our approach: Learn → Test → Drive.',
      ],
    },
    {
      id: 2,
      type: 'Problem Statement',
      title: 'Learning space science is abstract. Missions are real.',
      'sub-title':
        'Real planetary analogs exist, but they remain difficult to experience.',
      contenu: {
        message_principal:
          'The best Mars analog on Earth is useless if it remains a line in a PDF.',
        note_speaker:
          "Expliquer que les sites analogues existent déjà sur Terre, mais que les apprenants les découvrent principalement à travers des documents scientifiques. Donner l'exemple d'un analogue terrestre difficile à comprendre sans visualisation, puis introduire notre solution.",
        layout:
          'Split-screen horizontal ou vertical : problème à gauche, expérience interactive à droite. Une phrase forte au centre ou en bas pour souligner le décalage entre savoir et expérience.',
        duree_secondes: 30,
      },
      'visual-idea':
        'À gauche : document scientifique ou rapport PDF. À droite : apprenant utilisant un simulateur de rover 3D. Icônes représentant les quatre difficultés : information, distance, passivité et manque d’expérience.',
      visualCredit: 'NASA Planetary Analog Field Archive · High-Contrast Rim Study',
      layoutPreset: 'objectives',
      'bullet-points': [
        'Abstraction: Scientific information is difficult to visualize.',
        'Distance: Students cannot physically explore Mars or the Moon.',
        'Passive learning: Traditional learning offers little interaction.',
        'The gap: Learning about exploration is not the same as experiencing it.',
      ],
    },
    {
      id: 3,
      type: 'Solution Overview',
      title: 'Interactive Learning Web Platform',
      'sub-title':
        'From discovery to knowledge validation and practical experience.',
      contenu: {
        message_principal:
          'One platform to understand, test, and experience planetary exploration.',
        note_speaker:
          "Présenter les trois fonctionnalités comme un parcours d'apprentissage : découvrir les analogues, vérifier sa compréhension, puis appliquer ses connaissances dans une simulation. Garder les détails pour les slides suivantes.",
        layout:
          "Trois colonnes de même taille, chacune avec une capture d'écran, un titre court et une phrase descriptive. Ajouter une flèche circulaire ou une ligne de progression en bas.",
        duree_secondes: 25,
      },
      'visual-idea':
        'Trois captures d’écran réelles de l’application : 1. Explorer — carte interactive. 2. Challenge — interface de quiz. 3. Rover Mission — simulateur 3D. Flèches reliant les trois piliers pour illustrer la progression pédagogique. Logos des sources : NASA Mars Trek, HiRISE, REMS et USGS.',
      visualCredit: 'NASA Mars Trek · HiRISE · REMS · USGS Horizon Projection',
      layoutPreset: 'narrative',
      'bullet-points': [
        'EXPLORE: Interactive Earth ↔ Mars ↔ Moon analog map.',
        'CHALLENGE: Interactive quizzes to test scientific knowledge.',
        'ROVER MISSION: 3D rover simulator on real NASA terrain data.',
        'WEB-BASED: Accessible directly from the browser, no installation.',
      ],
    },
    {
      id: 4,
      type: 'Product Demonstration — Interactive Learning',
      title: 'Knowledge is only real when it is tested.',
      'sub-title':
        'Turn scientific knowledge into interactive learning challenges.',
      contenu: {
        message_principal:
          'Every question is a mini-mission. Every wrong answer becomes a lesson.',
        note_speaker:
          "Expliquer que l'apprenant ne fait pas que lire des informations : il doit répondre, réfléchir et recevoir une explication immédiate. Mettre en avant trois notions pédagogiques : active learning, formative assessment et spaced practice.",
        layout:
          'Deux colonnes : à gauche, interface de quiz avec les réponses possibles ; à droite, feedback scientifique et progression de l’apprenant. Garder une question centrale bien lisible.',
        duree_secondes: 25,
      },
      'visual-idea':
        'Mockup d’une question : "−60 °C average temperature, less than 10 mm of rainfall per year: Which Earth site is the analog?" Quatre réponses possibles avec les noms ou images des sites. Barre de progression inspirée d’un HUD de mission spatiale.',
      visualCredit: 'Atacama Hyper-Arid Ridge · Mars Analog Climate Profile',
      layoutPreset: 'grid',
      'bullet-points': [
        'Interactive quizzes to identify the correct planetary analog.',
        'Immediate feedback with scientific explanations.',
        'Questions based on peer-reviewed scientific literature.',
        'Measurable progress through scores and concept mastery.',
      ],
    },
    {
      id: 5,
      type: 'Product Demonstration — Explorer',
      title: 'From your browser: walk the analogs of Mars — on Earth.',
      'sub-title':
        'Discover and compare real locations across Earth and Mars.',
      description:
        'Explore a live NASA Mars Trek elevation basemap and compare Martian landmarks directly alongside their Earth geological analogs.',
      contenu: {
        message_principal:
          'See Mauna Loa & Grand Canyon. Understand Olympus Mons & Gale Crater.',
        note_speaker:
          "Faire une démonstration de l'Explorer : Mars & Earth Explorer et Comparison Lab (Gale Crater ↔ Grand Canyon, Olympus Mons ↔ Mauna Loa). Insister sur les données scientifiques NASA Mars Trek, PDS et USGS.",
        layout:
          'À gauche : fiches comparatives. À droite : captures réelles de Mars & Earth Explorer et Comparison Lab avec description.',
        duree_secondes: 30,
      },
      'visual-idea':
        'Captures réelles de Mars & Earth Explorer et Comparison Lab (Gale Crater ↔ Grand Canyon).',
      visualCredit: 'NASA Mars Trek · MGS MOLA · PIA12461 · ISS015-E-7852 · USGS',
      layoutPreset: 'specs',
      galleryImages: [
        {
          src: '/assets/aistudio/image_a9462872.png',
          caption: 'Mars & Earth Explorer — NASA Mars Trek elevation map & 5 featured locations',
        },
        {
          src: '/assets/aistudio/image_1d293f49.png',
          caption: 'Comparison Lab — Synchronized Gale Crater ↔ Grand Canyon satellite views',
        },
      ],
      'bullet-points': [
        'Interactive satellite map connecting Earth and planetary locations.',
        'Scientific comparisons: height, geology and climate.',
        'Educational profiles with images, metrics and explanations.',
        'Data sources: NASA Mars Trek, PDS, Photojournal and USGS EarthExplorer.',
      ],
    },
    {
      id: 6,
      type: 'Product Demonstration — 3D Simulation',
      title: "Don't just learn about Mars. Drive it.",
      'sub-title':
        'Experience rover navigation through a 3D simulation powered by NASA terrain data.',
      contenu: {
        message_principal:
          "Mars gravity is not just a number to memorize. It's an experience to explore.",
        note_speaker:
          "C'est le moment fort de la présentation. Montrer directement le simulateur et expliquer brièvement la différence entre le pilotage sur Terre et sur Mars. Faire une démonstration live de 20 secondes ou diffuser une vidéo de gameplay préparée. Tester la démonstration avant le pitch.",
        layout:
          'Grand visuel du simulateur occupant presque toute la slide. Ajouter un encadré de télémétrie (gravité, vent, tempête de poussière, symétrie 44 %).',
        duree_secondes: 40,
      },
      'visual-idea':
        'Capture d’écran plein écran du rover sur le terrain martien. HUD visible avec les données de télémétrie (gravity, wind speed, meteo: dust storm, symmetry = 44%).',
      visualCredit: 'NASA MOLA / HiRISE DEM · Gale Crater 3D Telemetry Terrain',
      layoutPreset: 'list',
      'bullet-points': [
        'Simulate the similarities when testing rovers',
        'Simulate the differences when testing rovers',
        'Get a touch of real data',
        'Rovers missions',
      ],
    },
    {
      id: 7,
      type: 'Perspectives',
      title: 'Perspectives & Next Steps',
      'sub-title': 'Future improvements for Operation Red Rock',
      contenu: {
        note_speaker:
          "Terminer en présentant les perspectives d'évolution de la plateforme (cours, Kids Mode, niveaux avancés, missions lunaires) et inviter le jury à scanner le QR code.",
        layout:
          'À gauche : perspectives d’évolution. À droite : QR code interactif vers l’application live.',
        duree_secondes: 35,
      },
      'visual-idea':
        'Grand QR code menant directement à l’application live et perspectives d’évolution.',
      visualCredit: 'NASA / USGS Open Planetary Data · Apache-2.0',
      layoutPreset: 'activity',
      'bullet-points': [
        'Improve challenges and courses',
        'Add Kids Mode',
        'Advanced level integration',
        'Improve and add Moon missions to the game',
      ],
    },
  ],
};
