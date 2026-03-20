import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Wand2 } from "lucide-react";
import { useState } from "react";
import { EFFECTS, EFFECT_CATEGORIES, type EffectConfig } from "../types/editor";

interface EffectsPanelProps {
  selectedEffectId: string | null;
  onSelectEffect: (effect: EffectConfig | null) => void;
}

export function EffectsPanel({
  selectedEffectId,
  onSelectEffect,
}: EffectsPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? EFFECTS.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()),
      )
    : EFFECTS;

  const getByCategory = (cat: string) =>
    filtered.filter((e) => e.category === cat);
  const defaultOpen = EFFECT_CATEGORIES.map((c) => c.id);

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        background: "#1A1F27",
        borderLeft: "1px solid #2A3342",
        width: 240,
        minWidth: 200,
        maxWidth: 280,
      }}
      data-ocid="effects_panel.panel"
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-4 h-4" style={{ color: "#2F7DFF" }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#A6AFBF" }}
          >
            Effects
          </span>
        </div>
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ color: "#A6AFBF" }}
          />
          <Input
            placeholder="Search effects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 text-xs border-0"
            style={{ background: "#0F1115", color: "#E6EAF2" }}
            data-ocid="effects_panel.search_input"
          />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #2A3342" }} />

      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          <button
            type="button"
            onClick={() => onSelectEffect(null)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg mb-2 text-xs transition-all",
              selectedEffectId === null ? "ring-2" : "hover:bg-white/5",
            )}
            style={
              selectedEffectId === null
                ? {
                    background: "#2F7DFF22",
                    color: "#2F7DFF",
                    outline: "2px solid #2F7DFF",
                  }
                : { color: "#A6AFBF" }
            }
            data-ocid="effects_panel.none_button"
          >
            <div
              className="w-4 h-4 rounded border flex items-center justify-center"
              style={{ borderColor: "#2A3342" }}
            >
              {selectedEffectId === null && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#2F7DFF" }}
                />
              )}
            </div>
            <span>No Effect</span>
          </button>

          {search && filtered.length === 0 ? (
            <div
              className="text-center py-6"
              data-ocid="effects_panel.empty_state"
            >
              <p className="text-xs" style={{ color: "#A6AFBF" }}>
                No effects found
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={defaultOpen}>
              {EFFECT_CATEGORIES.map((cat) => {
                const catEffects = getByCategory(cat.id);
                if (catEffects.length === 0) return null;
                return (
                  <AccordionItem
                    key={cat.id}
                    value={cat.id}
                    style={{ borderColor: "#2A3342" }}
                  >
                    <AccordionTrigger
                      className="text-xs font-semibold uppercase tracking-wider py-2 hover:no-underline"
                      style={{ color: "#A6AFBF" }}
                      data-ocid={`effects_panel.${cat.id}.tab`}
                    >
                      {cat.label}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="grid grid-cols-1 gap-1.5">
                        {catEffects.map((effect, i) => (
                          <EffectCard
                            key={effect.id}
                            effect={effect}
                            isActive={selectedEffectId === effect.id}
                            onSelect={onSelectEffect}
                            index={i + 1}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

interface EffectCardProps {
  effect: EffectConfig;
  isActive: boolean;
  onSelect: (effect: EffectConfig) => void;
  index: number;
}

function EffectCard({ effect, isActive, onSelect, index }: EffectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(effect)}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all text-xs",
        isActive ? "ring-2" : "hover:bg-white/5",
      )}
      style={
        isActive
          ? {
              background: "#2F7DFF22",
              color: "#E6EAF2",
              outline: "2px solid #2F7DFF",
            }
          : { color: "#A6AFBF" }
      }
      data-ocid={`effects_panel.item.${index}`}
    >
      <div
        className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center"
        style={{
          background: `${effect.swatch}33`,
          border: `1px solid ${effect.swatch}66`,
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: effect.swatch }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium" style={{ color: "#E6EAF2", fontSize: 11 }}>
          {effect.name}
        </div>
        <div className="truncate" style={{ color: "#A6AFBF", fontSize: 10 }}>
          {effect.description}
        </div>
      </div>
      {isActive && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#2F7DFF" }}
        />
      )}
    </button>
  );
}
