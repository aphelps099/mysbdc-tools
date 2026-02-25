import type { Lesson } from '../lesson-types';
import { lesson01 } from './lesson-01-roles';
import { lesson02 } from './lesson-02-prompt-body';
import { lesson03 } from './lesson-03-context';
import { lesson04 } from './lesson-04-specificity';
import { lesson05 } from './lesson-05-iteration';
import { lesson06 } from './lesson-06-tone';
import { lesson07 } from './lesson-07-rag';
import { lesson08 } from './lesson-08-pii';
import { lesson09 } from './lesson-09-templates';
import { lesson10 } from './lesson-10-putting-it-together';

export const LESSONS: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
