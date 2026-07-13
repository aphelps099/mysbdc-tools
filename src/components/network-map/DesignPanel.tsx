'use client';

import { REGIONS } from './regions';
import { BASEMAP_OPTIONS, DEFAULT_STYLE } from './style';
import type { MapStyle } from './types';

/* ═══════════════════════════════════════════════════════
   DesignPanel — customize the shared look of the map:
   region colors, pin colors, borders, the investment ramp,
   and the basemap. Changes are shared with everyone and
   flow through to PNG/PDF exports.
   ═══════════════════════════════════════════════════════ */

interface DesignPanelProps {
  style: MapStyle;
  onChange(patch: Partial<MapStyle>): void;
  onReset(): void;
}

function Swatch({ label, value, onChange }: { label: string; value: string; onChange(hex: string): void }) {
  return (
    <label className="nm-swatch">
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} />
      <span>{label}</span>
    </label>
  );
}

export default function DesignPanel({ style, onChange, onReset }: DesignPanelProps) {
  const setRegionColor = (id: number, hex: string) =>
    onChange({ regionColors: { ...style.regionColors, [String(id)]: hex } });

  return (
    <div className="nm-design">
      <h3 className="nm-section-title" style={{ marginTop: 2 }}>
        Basemap
      </h3>
      <select
        aria-label="Basemap style"
        className="nm-search"
        value={style.basemap}
        onChange={(event) => onChange({ basemap: event.target.value })}
      >
        {BASEMAP_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="nm-help">&ldquo;None&rdquo; hides the street map for a clean, color-only picture.</p>

      <h3 className="nm-section-title">Region colors</h3>
      <div className="nm-swatch-grid">
        {REGIONS.map((region) => (
          <Swatch
            key={region.id}
            label={region.name}
            value={style.regionColors[String(region.id)] || region.color}
            onChange={(hex) => setRegionColor(region.id, hex)}
          />
        ))}
      </div>

      <h3 className="nm-section-title">Pins</h3>
      <div className="nm-swatch-grid">
        <Swatch label="Host fill" value={style.hostColor} onChange={(hex) => onChange({ hostColor: hex })} />
        <Swatch label="Host border" value={style.hostBorder} onChange={(hex) => onChange({ hostBorder: hex })} />
        <Swatch label="Branch fill" value={style.branchColor} onChange={(hex) => onChange({ branchColor: hex })} />
        <Swatch label="Branch border" value={style.branchBorder} onChange={(hex) => onChange({ branchBorder: hex })} />
      </div>

      <h3 className="nm-section-title">Borders &amp; fill</h3>
      <div className="nm-swatch-grid">
        <Swatch label="Region border" value={style.borderColor} onChange={(hex) => onChange({ borderColor: hex })} />
        <Swatch label="Empty background" value={style.paper} onChange={(hex) => onChange({ paper: hex })} />
      </div>
      <label className="nm-slider-row">
        <span>Region border width</span>
        <input
          type="range"
          min={0}
          max={6}
          step={0.2}
          value={style.borderWidth}
          onChange={(event) => onChange({ borderWidth: Number(event.target.value) })}
        />
      </label>
      <label className="nm-slider-row">
        <span>County color strength</span>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.02}
          value={style.territoryOpacity}
          onChange={(event) => onChange({ territoryOpacity: Number(event.target.value) })}
        />
      </label>

      <h3 className="nm-section-title">Investment heat colors</h3>
      <p className="nm-help">Used when the county fill (Data tab) is set to a $ mode.</p>
      <div className="nm-swatch-grid">
        <Swatch label="Low $" value={style.choroplethFrom} onChange={(hex) => onChange({ choroplethFrom: hex })} />
        <Swatch label="High $" value={style.choroplethTo} onChange={(hex) => onChange({ choroplethTo: hex })} />
      </div>

      <button
        type="button"
        className="nm-btn"
        style={{ marginTop: 18, width: '100%' }}
        onClick={() => {
          if (window.confirm('Reset the map design to the default colors for everyone?')) onReset();
        }}
      >
        Reset design to defaults
      </button>
      <p className="nm-help">
        Design is shared — your color choices show for everyone and in every export. Defaults:{' '}
        {DEFAULT_STYLE.regionColors['1']} and up.
      </p>
    </div>
  );
}
