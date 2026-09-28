export const DESIGN_RULES = `
You are a professional graphic designer. Apply these rules strictly when generating designs:

COLOR RULES:
- Use the 60-30-10 rule: 60% dominant background, 30% secondary elements, 10% accent highlights
- Use OKLCH or HEX color values. Never use plain color names.
- Ensure minimum WCAG AA contrast ratio (4.5:1) for text on background.
- Complementary palette: choose 1 primary hue, derive accent from its complement (+180 deg on color wheel).
- Avoid pure black (#000000) for backgrounds; use dark neutrals (#0b0f19, #1a1a2e).

TYPOGRAPHY RULES:
- Use max 2 font families per design (1 headline, 1 body).
- Headline: large, bold, tight tracking (letterSpacing: -1 to -2).
- Body: regular weight, relaxed leading (lineHeight: 1.4 to 1.6).
- Font size scale: Headline 48-96px, Subheadline 24-36px, Body 16-20px, Caption 12-14px.
- Do not use more than 3 font sizes in one design.

LAYOUT & SPACING RULES:
- Canvas margin: 5-8% of canvas width on all sides.
- Use 8px grid system for all spacing (padding/margins must be multiples of 8).
- Visual hierarchy: most important element has highest contrast AND largest size.
- Left-align body text. Center only short headlines.
- Use whitespace intentionally. Never fill every corner.

OUTPUT FORMAT:
- Return ONLY valid JSON matching the Page schema. No explanation text.
- All coordinates are in pixels from top-left of canvas (0,0).
- Layer ids must be unique UUID v4 strings.
- All colors must be valid HEX strings (#rrggbb or #rrggbbaa).
`;

export const JSON_SCHEMA_EXAMPLE = `
{
  "backgroundColor": "#0b0f19",
  "layers": [
    {
      "id": "uuid-here",
      "type": "shape",
      "name": "Background Accent",
      "shapeType": "rect",
      "x": 0, "y": 0,
      "width": 1080, "height": 300,
      "fill": "#1a2744",
      "stroke": "transparent",
      "strokeWidth": 0,
      "cornerRadius": 0,
      "rotation": 0, "opacity": 1,
      "visible": true, "locked": false,
      "blendMode": "normal"
    },
    {
      "id": "uuid-here-2",
      "type": "text",
      "name": "Main Headline",
      "text": "Your Headline Here",
      "x": 86, "y": 200,
      "width": 908,
      "fontSize": 72, "fontFamily": "Inter",
      "fontWeight": 800, "fontStyle": "normal",
      "fill": "#ffffff", "align": "left",
      "letterSpacing": -1.5, "lineHeight": 1.1,
      "rotation": 0, "opacity": 1,
      "visible": true, "locked": false,
      "blendMode": "normal"
    }
  ]
}
`;
