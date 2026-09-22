import { Lightbulb, Award, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getPhaseColors } from './phase-colors';

interface KeyConcept {
  id: string;
  label: string;
}

interface Skill {
  id: string;
  label: string;
}

interface ReviewPoint {
  id: string;
  text: string;
}

export interface SummaryData {
  keyConcepts: KeyConcept[];
  skills: Skill[];
  reviewPoints: ReviewPoint[];
}

interface SummaryCardProps {
  summary: SummaryData;
  phaseId: string;
}

export function SummaryCard({ summary, phaseId }: SummaryCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['concepts', 'skills', 'review']),
  );
  const colors = getPhaseColors(phaseId);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const sections = [
    {
      key: 'concepts',
      icon: Lightbulb,
      title: 'Conceptos clave',
      count: summary.keyConcepts.length,
      items: summary.keyConcepts.map((c) => c.label),
    },
    {
      key: 'skills',
      icon: Award,
      title: 'Habilidades adquiridas',
      count: summary.skills.length,
      items: summary.skills.map((s) => s.label),
    },
    {
      key: 'review',
      icon: ListChecks,
      title: 'Puntos de repaso rapido',
      count: summary.reviewPoints.length,
      items: summary.reviewPoints.map((r) => r.text),
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700"
        style={{ background: 'linear-gradient(to right, ' + colors.accent + ', ' + colors.accent + 'cc)' }}>
        <h3 className="flex items-center gap-2 text-base font-semibold text-white">
          <ListChecks className="h-5 w-5" />
          Resumen del modulo
        </h3>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.key);
          const SectionIcon = section.icon;

          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                aria-expanded={isExpanded}
              >
                <SectionIcon
                  className={`h-4 w-4 ${colors.text} ${colors.textDark}`}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {section.title}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {section.count}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4">
                  <ul className="space-y-1.5">
                    {section.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700/30 dark:text-gray-300"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark}`}
                          aria-hidden="true"
                        >
                          {idx + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
