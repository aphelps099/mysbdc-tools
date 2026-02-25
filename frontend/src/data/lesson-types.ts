/** Type definitions for the SBDC Learn micro-lesson portal */

export type SectionType = 'concept' | 'prompt' | 'output' | 'tip' | 'exercise' | 'divider';

export interface LessonSection {
  type: SectionType;
  title?: string;
  body?: string;
  prompt?: string;
  output?: string;
  variant?: string;
  modifiedPrompt?: string;
  modifiedOutput?: string;
  note?: string;
  label?: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  kicker: string;
  icon: string;
  duration: string;
  sections: LessonSection[];
  keyTakeaways: string[];
  nextLessonId: string | null;
  prevLessonId: string | null;
}
