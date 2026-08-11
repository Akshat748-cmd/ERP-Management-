export interface PortalGradientTheme {
  name: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accentText: string;      // headings/highlights on gradient surfaces
  glassBg: string;         // e.g. 'rgba(255,255,255,0.14)'
  glassBorder: string;     // e.g. 'rgba(255,255,255,0.25)'
}

export const PORTAL_GRADIENT_PRESETS: PortalGradientTheme[] = [
  {
    // Preset 0 — Royal Indigo (reference image style: blue-violet to warm gold)
    name: 'Royal Indigo & Gold',
    gradientFrom: '#3730a3',
    gradientVia: '#4f46e5',
    gradientTo: '#7c3aed',
    accentText: '#fbbf24',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 1 — Sapphire Ocean
    name: 'Sapphire Ocean',
    gradientFrom: '#1e3a5f',
    gradientVia: '#1d4ed8',
    gradientTo: '#0ea5e9',
    accentText: '#bae6fd',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 2 — Midnight Teal
    name: 'Midnight Teal',
    gradientFrom: '#0f2027',
    gradientVia: '#203a43',
    gradientTo: '#0d9488',
    accentText: '#5eead4',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 3 — Deep Violet Amethyst
    name: 'Deep Violet Amethyst',
    gradientFrom: '#1e0a3c',
    gradientVia: '#5b21b6',
    gradientTo: '#7c3aed',
    accentText: '#c4b5fd',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 4 — Slate Navy Premium
    name: 'Slate Navy Premium',
    gradientFrom: '#0f172a',
    gradientVia: '#1e3a8a',
    gradientTo: '#1d4ed8',
    accentText: '#93c5fd',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 5 — Emerald Forest
    name: 'Emerald Forest',
    gradientFrom: '#052e16',
    gradientVia: '#166534',
    gradientTo: '#15803d',
    accentText: '#86efac',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 6 — Cosmic Purple (like the reference image purple-blue)
    name: 'Cosmic Purple',
    gradientFrom: '#2d1b69',
    gradientVia: '#5b21b6',
    gradientTo: '#9333ea',
    accentText: '#e879f9',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  {
    // Preset 7 — Arctic Blue
    name: 'Arctic Blue',
    gradientFrom: '#1e3a5f',
    gradientVia: '#0369a1',
    gradientTo: '#0284c7',
    accentText: '#7dd3fc',
    glassBg: 'rgba(255, 255, 255, 0.14)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
];

export function getTenantGradient(tenantId: string | null | undefined): PortalGradientTheme {
  if (!tenantId || tenantId === 'default' || tenantId === 'platform') {
    return PORTAL_GRADIENT_PRESETS[0];
  }
  let hash = 0;
  for (let i = 0; i < tenantId.length; i++) {
    hash = tenantId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PORTAL_GRADIENT_PRESETS.length;
  return PORTAL_GRADIENT_PRESETS[index];
}

// Retain legacy exports for backward compatibility
export type PortalTheme = PortalGradientTheme;
export const defaultAMPSTheme: PortalGradientTheme = PORTAL_GRADIENT_PRESETS[0];
