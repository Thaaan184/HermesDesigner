import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const BlendModeSchema = z.enum(['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn']).default('normal');
const BaseLayerSchema = z.object({
  id: z.string().default(() => uuidv4()),
  name: z.string().default('Layer'),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  blendMode: BlendModeSchema,
  x: z.number(),
  y: z.number(),
});

const TextLayerSchema = BaseLayerSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number().min(1).max(1000),
  fontFamily: z.string().default('Inter'),
  fontWeight: z.union([z.number(), z.string()]).default(400),
  fontStyle: z.enum(['normal','italic']).default('normal'),
  fill: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).default('#000000'),
  align: z.enum(['left','center','right']).default('left'),
  letterSpacing: z.number().default(0),
  lineHeight: z.number().min(0.5).max(4).default(1.2),
  width: z.number().default(400),
});

const ShapeLayerSchema = BaseLayerSchema.extend({
  type: z.literal('shape'),
  shapeType: z.enum(['rect','circle','path','line','ellipse']),
  width: z.number().min(0),
  height: z.number().min(0),
  fill: z.string().default('#3b82f6'),
  stroke: z.string().default('transparent'),
  strokeWidth: z.number().default(0),
  cornerRadius: z.number().default(0),
  pathData: z.string().optional(),
});

const ImageLayerSchema = BaseLayerSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  width: z.number(),
  height: z.number(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  cropWidth: z.number().optional(),
  cropHeight: z.number().optional(),
});

export const LayerSchema = z.discriminatedUnion('type', [
  TextLayerSchema, ShapeLayerSchema, ImageLayerSchema
]);

export const AIOutputSchema = z.object({
  backgroundColor: z.string().default('#ffffff'),
  layers: z.array(LayerSchema),
});

export function validateAIOutput(raw: unknown): { success: true; data: z.infer<typeof AIOutputSchema> } | { success: false; error: string } {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result = AIOutputSchema.safeParse(parsed);
    if (result.success) return { success: true, data: result.data };
    return { success: false, error: result.error.message };
  } catch (e) {
    return { success: false, error: `JSON parse error: ${e}` };
  }
}
