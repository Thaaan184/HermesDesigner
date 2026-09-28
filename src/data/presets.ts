import { CanvasPreset } from '../types/canvas';

export const CANVAS_PRESETS: CanvasPreset[] = [
  { name: 'Instagram Post',       width: 1080, height: 1080, dpi: 72,  category: 'Social Media' },
  { name: 'Instagram Story',      width: 1080, height: 1920, dpi: 72,  category: 'Social Media' },
  { name: 'Instagram Carousel',   width: 1080, height: 1350, dpi: 72,  category: 'Social Media' },
  { name: 'Facebook Cover',       width: 1640, height: 924,  dpi: 72,  category: 'Social Media' },
  { name: 'LinkedIn Banner',      width: 1584, height: 396,  dpi: 72,  category: 'Social Media' },
  { name: 'YouTube Thumbnail',    width: 1280, height: 720,  dpi: 72,  category: 'Social Media' },
  { name: 'Twitter/X Post',       width: 1200, height: 675,  dpi: 72,  category: 'Social Media' },
  { name: 'TikTok Cover',         width: 1080, height: 1920, dpi: 72,  category: 'Social Media' },
  { name: 'A4 Portrait (300 DPI)', width: 2480, height: 3508, dpi: 300, category: 'Print' },
  { name: 'A4 Landscape (300 DPI)', width: 3508, height: 2480, dpi: 300, category: 'Print' },
  { name: 'A3 Portrait (300 DPI)', width: 3508, height: 4961, dpi: 300, category: 'Print' },
  { name: 'Business Card',         width: 1050, height: 600,  dpi: 300, category: 'Print' },
  { name: 'Poster 18x24in',        width: 5400, height: 7200, dpi: 300, category: 'Print' },
  { name: 'Presentation 16:9',     width: 1920, height: 1080, dpi: 72,  category: 'Presentation' },
  { name: 'Custom',                width: 0,    height: 0,    dpi: 72,  category: 'Custom' },
];
