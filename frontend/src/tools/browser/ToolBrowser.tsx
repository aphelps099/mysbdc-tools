'use client';

import { useState, useMemo } from 'react';
import type { ToolDefinition } from '../types';
import { toolRegistry, categories, getToolsByCategory } from '../tool-registry';
import './tool-browser.css';

/* ═══════════════════════════════════════════════════════
   Tool Browser — Category grid that lists available tools
   ═══════════════════════════════════════════════════════ */

interface ToolBrowserProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

// Map tagColor names → hex
const TAG_COLORS: Record<string, string> = {
  blue: '#2456e3',
  green: '#16a34a',
  coral: '#e05a6f',
  red: '#e05a6f',
  amber: '#d97706',
  purple: '#8b5cf6',
};

export default function ToolBrowser({ onSelectTool }: ToolBrowserProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(
    () => getToolsByCategory(activeCategory),
    [activeCategory]
  );

  // Only show categories that have tools, plus "All"
  const visibleCategories = useMemo(() => {
    const usedCats = new Set(toolRegistry.map((t) => t.category));
    return categories.filter((c) => c.id === 'all' || usedCats.has(c.id));
  }, []);

  return (
    <div className="tool-browser">
      {/* Header */}
      <div className="tb-header">
        <h1 className="tb-title">Advisor Tools</h1>
        <p className="tb-subtitle">
          Structured prompts that build themselves. Pick a workspace, then a tool.
        </p>
      </div>

      {/* Workspace tabs */}
      <div className="tb-workspaces">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            className={`tb-workspace${activeCategory === cat.id ? ' tb-workspace--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            type="button"
          >
            {cat.color && (
              <span
                className="tb-workspace-dot"
                style={{ background: activeCategory === cat.id ? '#fff' : cat.color }}
              />
            )}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tool cards grid */}
      {filteredTools.length > 0 ? (
        <div className="tb-grid">
          {filteredTools.map((tool) => {
            const dotColor = TAG_COLORS[tool.tagColor] || TAG_COLORS.blue;
            return (
              <div
                key={tool.id}
                className="tb-card"
                onClick={() => onSelectTool(tool)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectTool(tool);
                }}
              >
                <div className="tb-card-badge">
                  <span className="tb-card-dot" style={{ background: dotColor }} />
                  {tool.tag}
                </div>
                <h3 className="tb-card-title">{tool.title}</h3>
                <p className="tb-card-desc">{tool.description}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tb-empty">
          No tools in this workspace yet. More coming soon.
        </div>
      )}
    </div>
  );
}
