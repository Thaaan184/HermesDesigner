import { DESIGN_RULES, JSON_SCHEMA_EXAMPLE } from './design-rules';
import { Page } from '../types/canvas';

export function buildGeneratePrompt(userRequest: string, width: number, height: number): string {
  return [
    DESIGN_RULES,
    '',
    `CANVAS SIZE: ${width}px x ${height}px`,
    '',
    `USER REQUEST: ${userRequest}`,
    '',
    'Generate a complete graphic design as JSON with the exact schema shown below.',
    'Output ONLY the raw JSON object. No markdown, no code fences, no explanation.',
    '',
    'SCHEMA EXAMPLE:',
    JSON_SCHEMA_EXAMPLE,
  ].join('\n');
}

export function buildRevisePrompt(userRequest: string, page: Page, targetIds: string[]): string {
  const targetLayers = page.layers.filter(l => targetIds.includes(l.id));
  return [
    DESIGN_RULES,
    '',
    `CANVAS SIZE: ${page.width}px x ${page.height}px`,
    'TARGET LAYERS TO MODIFY (only change these):',
    JSON.stringify(targetLayers, null, 2),
    '',
    'ALL LAYERS (context):',
    JSON.stringify(page.layers, null, 2),
    '',
    `USER REVISION REQUEST: ${userRequest}`,
    '',
    'Return: { "backgroundColor": "...", "layers": [...] }',
    'Output ONLY the raw JSON. No markdown, no explanation.',
  ].join('\n');
}

export function buildSuggestPrompt(page: Page): string {
  return [
    DESIGN_RULES,
    '',
    `CURRENT DESIGN - Canvas: ${page.width}px x ${page.height}px - Background: ${page.backgroundColor}`,
    'Layers:',
    JSON.stringify(page.layers, null, 2),
    '',
    'Analyze this design and provide 3-5 specific, actionable improvement suggestions.',
    'Format as JSON array: [{ "issue": "...", "suggestion": "...", "layerId": "..." }]',
  ].join('\n');
}
