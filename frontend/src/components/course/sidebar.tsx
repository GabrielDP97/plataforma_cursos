import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import type { Module, Lesson, LessonProgress } from '../../api/types';

interface SidebarProps {
  modules: Module[];
  lessonsByModule: Record<string, Lesson[]>;
  progressByLesson: Record<string, LessonProgress | null>;
  currentLessonId: string | null;
  onLessonClick: (lessonId: string) => void;
  courseTitle: string;
}

export function Sidebar({
  modules,
  lessonsByModule,
  progressByLesson,
  currentLessonId,
  onLessonClick,
  courseTitle,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    if (modules.length > 0) {
      return new Set([modules[0].id]);
    }
    return new Set();
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getLessonStatus = (lessonId: string): 'completed' | 'in-progress' | 'not-started' => {
    const progress = progressByLesson[lessonId];
    if (!progress) return 'not-started';
    if (progress.status === 'completed') return 'completed';
    if (progress.status === 'in_progress') return 'in-progress';
    return 'not-started';
  };

  const getStatusIcon = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in-progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'not-started':
        return <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 dark:text-white">{courseTitle}</h2>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => {
          const lessons = lessonsByModule[module.id] || [];
          const isExpanded = expandedModules.has(module.id);
          const completedLessons = lessons.filter((l) => {
            const p = progressByLesson[l.id];
            return p && p.status === 'completed';
          }).length;

          return (
            <div key={module.id} className="border-b border-gray-100 dark:border-gray-800">
              {/* Module header */}
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50"
                aria-expanded={isExpanded}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  {moduleIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 line-clamp-1 block dark:text-gray-200">{module.title}</span>
                  {lessons.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {completedLessons}/{lessons.length} completadas
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                )}
              </button>

              {/* Lessons list */}
              {isExpanded && (
                <div className="pb-2 pl-6 pr-2">
                  {lessons.map((lesson) => {
                    const status = getLessonStatus(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onLessonClick(lesson.id)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm transition-all ${
                          isCurrent
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                        }`}
                      >
                        {getStatusIcon(status)}
                        <span className="line-clamp-1 flex-1">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
