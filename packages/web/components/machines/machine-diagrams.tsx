import React from 'react';

// ---------------------------------------------------------------------------
// Compact Technical Side-Profile CAD / Schematic Diagrams
// ---------------------------------------------------------------------------

export function ExcavatorSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <rect x="28" y="96" width="104" height="20" rx="8" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <circle cx="40" cy="106" r="7" fill="#52525B" />
      <circle cx="120" cy="106" r="7" fill="#52525B" />
      <circle cx="62" cy="108" r="4.5" fill="#000000" />
      <circle cx="80" cy="108" r="4.5" fill="#000000" />
      <circle cx="98" cy="108" r="4.5" fill="#000000" />
      <line x1="28" y1="106" x2="132" y2="106" stroke="#000000" strokeWidth="1" strokeDasharray="4,3" />

      <path d="M 36 96 L 36 68 Q 38 56 48 56 L 94 56 L 94 96 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <line x1="42" y1="64" x2="42" y2="84" stroke="#71717A" strokeWidth="1.5" />
      <line x1="47" y1="64" x2="47" y2="84" stroke="#71717A" strokeWidth="1.5" />
      <rect x="58" y="44" width="3" height="12" fill="#000000" />

      <path d="M 76 96 L 76 46 L 108 46 L 114 68 L 114 96 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="82,50 105,50 110,68 82,68" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <path d="M 96 78 Q 120 28 148 40 L 152 46 Q 124 38 102 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="88" y1="84" x2="122" y2="46" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />

      <path d="M 148 40 L 180 82 L 174 86 L 144 46 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <line x1="126" y1="36" x2="162" y2="60" stroke="#52525B" strokeWidth="2" strokeLinecap="round" />

      <path d="M 180 82 Q 198 88 194 104 L 176 104 Q 172 90 174 86 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
      <polygon points="194,104 199,107 192,107" fill="#000000" />
      <polygon points="188,104 193,107 186,107" fill="#000000" />

      <circle cx="96" cy="78" r="2.5" fill="#000000" />
      <circle cx="148" cy="40" r="2.5" fill="#000000" />
      <circle cx="180" cy="82" r="2.5" fill="#000000" />
    </svg>
  );
}

export function DozerSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="58" cy="78" r="11" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <circle cx="44" cy="106" r="9" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <circle cx="130" cy="106" r="9" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <path
        d="M 44 97 L 54 69 A 11 11 0 0 1 66 71 L 126 99 A 9 9 0 0 1 130 115 L 44 115 A 9 9 0 0 1 44 97 Z"
        fill="#E4E4E7"
        stroke="#000000"
        strokeWidth="1.8"
      />
      <circle cx="68" cy="108" r="4.5" fill="#000000" />
      <circle cx="86" cy="108" r="4.5" fill="#000000" />
      <circle cx="104" cy="108" r="4.5" fill="#000000" />

      <path d="M 52 86 L 52 66 L 70 66 L 80 48 L 118 48 L 128 72 L 128 92 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <polygon points="74,66 78,40 108,40 114,66" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="78,62 82,44 104,44 108,62" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <line x1="116" y1="48" x2="116" y2="34" stroke="#000000" strokeWidth="3" />

      <line x1="68" y1="96" x2="148" y2="94" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="110" y1="72" x2="146" y2="88" stroke="#52525B" strokeWidth="2.8" />
      <path d="M 148 72 Q 160 92 154 114 L 144 114 Q 148 94 140 72 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
      <rect x="138" y="68" width="9" height="4" fill="#000000" />

      <line x1="48" y1="88" x2="32" y2="98" stroke="#000000" strokeWidth="3.2" />
      <path d="M 32 98 L 26 114 L 30 114 L 36 102 Z" fill="#000000" />
    </svg>
  );
}

export function DumpTruckSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="56" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="56" cy="102" r="7" fill="#E4E4E7" />
      <circle cx="140" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="140" cy="102" r="7" fill="#E4E4E7" />
      <circle cx="174" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="174" cy="102" r="7" fill="#E4E4E7" />

      <rect x="40" y="86" width="144" height="6" fill="#000000" />
      <rect x="80" y="88" width="22" height="10" rx="2" fill="#52525B" stroke="#000000" strokeWidth="1" />

      <path d="M 36 86 L 36 68 Q 38 48 48 46 L 78 46 L 82 86 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 44 64 L 44 52 Q 46 48 54 48 L 76 48 L 76 64 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <path d="M 86 84 L 86 42 L 54 34 L 54 30 L 100 38 L 190 38 L 196 74 L 188 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="114" y1="44" x2="114" y2="82" stroke="#71717A" strokeWidth="1.5" />
      <line x1="138" y1="44" x2="138" y2="82" stroke="#71717A" strokeWidth="1.5" />
      <line x1="88" y1="84" x2="96" y2="58" stroke="#52525B" strokeWidth="3" />
    </svg>
  );
}

export function WheelLoaderSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="56" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="56" cy="98" r="9" fill="#E4E4E7" />
      <circle cx="128" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="128" cy="98" r="9" fill="#E4E4E7" />

      <path d="M 38 88 L 38 64 L 84 64 L 88 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 74 64 L 78 40 L 102 40 L 106 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="80,60 82,44 98,44 100,60" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <rect x="88" y="78" width="6" height="14" fill="#000000" />

      <path d="M 96 78 L 152 74 L 174 96 L 168 98 L 148 78 L 96 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <polygon points="132,60 148,68 138,78" fill="#52525B" stroke="#000000" strokeWidth="1.2" />
      <line x1="102" y1="84" x2="134" y2="76" stroke="#000000" strokeWidth="2.8" />

      <path d="M 174 96 Q 196 98 194 72 L 182 72 Q 182 90 166 94 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

export function BackhoeSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="82" cy="94" r="22" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="82" cy="94" r="10" fill="#E4E4E7" />
      <circle cx="142" cy="102" r="14" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="142" cy="102" r="6" fill="#E4E4E7" />

      <path d="M 68 84 L 72 44 L 106 44 L 110 84 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="76,80 78,48 102,48 104,80" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <path d="M 110 84 L 110 68 L 148 68 L 148 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />

      <line x1="108" y1="78" x2="174" y2="92" stroke="#000000" strokeWidth="3.5" />
      <path d="M 174 92 Q 192 94 190 76 L 180 76 Q 180 88 170 90 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />

      <rect x="58" y="74" width="10" height="20" fill="#000000" />
      <path d="M 60 78 Q 44 48 30 62 L 26 66 Q 38 54 56 82 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="30" y1="62" x2="20" y2="92" stroke="#000000" strokeWidth="2.8" />
      <path d="M 20 92 Q 12 98 16 106 L 24 102 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

export function CraneSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="46" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="46" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="74" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="74" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="134" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="134" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="162" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="162" cy="106" r="5" fill="#E4E4E7" />

      <rect x="32" y="92" width="156" height="8" fill="#000000" />
      <rect x="30" y="98" width="8" height="14" fill="#000000" />
      <rect x="176" y="98" width="8" height="14" fill="#000000" />
      <path d="M 166 92 L 166 76 L 188 76 L 188 92 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.5" />

      <circle cx="96" cy="88" r="8" fill="#52525B" />
      <rect x="100" y="66" width="22" height="20" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      <rect x="70" y="68" width="18" height="18" fill="#000000" stroke="#000000" />

      <path d="M 88 74 L 170 30 L 174 36 L 92 80 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <path d="M 164 33 L 198 15 L 200 19 L 168 37 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.5" />
      <line x1="98" y1="82" x2="134" y2="52" stroke="#000000" strokeWidth="2.8" />
      <line x1="198" y1="18" x2="198" y2="52" stroke="#52525B" strokeWidth="1" strokeDasharray="2,2" />
      <rect x="194" y="52" width="8" height="8" fill="#000000" />
    </svg>
  );
}

export function MotorGraderSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="50" cy="102" r="15" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="50" cy="102" r="6" fill="#E4E4E7" />
      <circle cx="82" cy="102" r="15" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="82" cy="102" r="6" fill="#E4E4E7" />
      <circle cx="178" cy="102" r="14" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="178" cy="102" r="6" fill="#E4E4E7" />

      <path d="M 94 76 Q 130 54 176 96 L 176 100 Q 132 58 94 82 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <rect x="36" y="74" width="56" height="18" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />

      <path d="M 88 74 L 92 46 L 114 46 L 118 74 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="94,70 96,50 110,50 112,70" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <circle cx="132" cy="84" r="8" fill="#52525B" stroke="#000000" strokeWidth="1.2" />
      <path d="M 120 98 L 148 94 L 146 106 L 118 110 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

export function MachineSideDiagram({ type, className = '' }: { type?: string; className?: string }) {
  const t = (type || '').toLowerCase();
  if (t.includes('excavat')) return <ExcavatorSideDiagram className={className} />;
  if (t.includes('dozer') || t.includes('bull')) return <DozerSideDiagram className={className} />;
  if (t.includes('dump') || t.includes('tipper') || t.includes('truck')) return <DumpTruckSideDiagram className={className} />;
  if (t.includes('wheel') || (t.includes('loader') && !t.includes('backhoe'))) return <WheelLoaderSideDiagram className={className} />;
  if (t.includes('backhoe')) return <BackhoeSideDiagram className={className} />;
  if (t.includes('crane')) return <CraneSideDiagram className={className} />;
  if (t.includes('grader')) return <MotorGraderSideDiagram className={className} />;
  return <ExcavatorSideDiagram className={className} />;
}

// ---------------------------------------------------------------------------
// Diagram Presets Catalog for Visual Selection Downlist & Gallery
// ---------------------------------------------------------------------------

export interface MachineDiagramPreset {
  id: string;
  name: string;
  shortName: string;
  typeValue: string;
  codePrefix: string;
  defaultMake: string;
  defaultModel: string;
  defaultHourlyRate: number;
  defaultFuelCapacity: number;
  defaultFuelPct: number;
  defaultMeterType: string;
  description: string;
  DiagramComponent: React.ComponentType<{ className?: string }>;
}

export const MACHINE_DIAGRAM_PRESETS: MachineDiagramPreset[] = [
  {
    id: 'excavator',
    name: 'Excavator (Hydraulic Crawler)',
    shortName: 'Excavator',
    typeValue: 'excavator',
    codePrefix: 'EXC',
    defaultMake: 'Caterpillar',
    defaultModel: '320D3 Hydraulic Excavator',
    defaultHourlyRate: 2500,
    defaultFuelCapacity: 400,
    defaultFuelPct: 80,
    defaultMeterType: 'hours',
    description: 'Heavy earthmoving, trenching & bucket excavation',
    DiagramComponent: ExcavatorSideDiagram,
  },
  {
    id: 'dozer',
    name: 'Bulldozer / Crawler Dozer',
    shortName: 'Bulldozer',
    typeValue: 'dozer',
    codePrefix: 'DOZ',
    defaultMake: 'Komatsu',
    defaultModel: 'D65EX Crawler Dozer',
    defaultHourlyRate: 2800,
    defaultFuelCapacity: 450,
    defaultFuelPct: 85,
    defaultMeterType: 'hours',
    description: 'Heavy site clearing, earth-pushing & slope leveling',
    DiagramComponent: DozerSideDiagram,
  },
  {
    id: 'dump_truck',
    name: 'Dump Truck / Heavy Tipper',
    shortName: 'Dump Truck',
    typeValue: 'dump_truck',
    codePrefix: 'DMP',
    defaultMake: 'Volvo',
    defaultModel: 'A30G Articulated Hauler',
    defaultHourlyRate: 1800,
    defaultFuelCapacity: 300,
    defaultFuelPct: 75,
    defaultMeterType: 'km',
    description: 'Bulk material haulage, muck shifting & aggregate transit',
    DiagramComponent: DumpTruckSideDiagram,
  },
  {
    id: 'wheel_loader',
    name: 'Wheel Loader (Front End)',
    shortName: 'Wheel Loader',
    typeValue: 'wheel_loader',
    codePrefix: 'WLD',
    defaultMake: 'Caterpillar',
    defaultModel: '966M Wheel Loader',
    defaultHourlyRate: 2200,
    defaultFuelCapacity: 320,
    defaultFuelPct: 80,
    defaultMeterType: 'hours',
    description: 'High-volume stockpile loading & material handling',
    DiagramComponent: WheelLoaderSideDiagram,
  },
  {
    id: 'backhoe',
    name: 'Backhoe Loader',
    shortName: 'Backhoe',
    typeValue: 'backhoe',
    codePrefix: 'BKH',
    defaultMake: 'JCB',
    defaultModel: '3CX Eco Backhoe Loader',
    defaultHourlyRate: 1600,
    defaultFuelCapacity: 160,
    defaultFuelPct: 90,
    defaultMeterType: 'hours',
    description: 'Dual-purpose utility excavation & loader handling',
    DiagramComponent: BackhoeSideDiagram,
  },
  {
    id: 'crane',
    name: 'Mobile Crane (Telescopic)',
    shortName: 'Mobile Crane',
    typeValue: 'crane',
    codePrefix: 'CRN',
    defaultMake: 'Liebherr',
    defaultModel: 'LTM 1050 Mobile Crane',
    defaultHourlyRate: 3500,
    defaultFuelCapacity: 500,
    defaultFuelPct: 85,
    defaultMeterType: 'hours',
    description: 'Heavy structural lifting, girder placement & rigging',
    DiagramComponent: CraneSideDiagram,
  },
  {
    id: 'grader',
    name: 'Motor Grader',
    shortName: 'Motor Grader',
    typeValue: 'motor_grader',
    codePrefix: 'GRD',
    defaultMake: 'Caterpillar',
    defaultModel: '140M Motor Grader',
    defaultHourlyRate: 2400,
    defaultFuelCapacity: 350,
    defaultFuelPct: 80,
    defaultMeterType: 'hours',
    description: 'High-precision road subgrade grading & finishing',
    DiagramComponent: MotorGraderSideDiagram,
  },
];
