import { inject, Injectable } from '@angular/core';

import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { translations } from '@zxcvbn-ts/language-en';
import { PSM_CONFIG } from './password-strength-meter.types';
export const DEFAULT_CONFIG = {
  translations: translations, // 直接使用导出的对象
};

@Injectable({ providedIn: 'root' })
export class PasswordStrengthMeterService {
  private options = inject(PSM_CONFIG, { optional: true });

  constructor() {
    if (this.options) {
      zxcvbnOptions.setOptions(this.options);
    } else {
      zxcvbnOptions.setOptions(DEFAULT_CONFIG);
    }
  }

  /**
   *  this will return the password strength score in number
   *  0 - too guessable
   *  1 - very guessable
   *  2 - somewhat guessable
   *  3 - safely unguessable
   *  4 - very unguessable
   *
   *  @param password - Password
   */
  score(password: string): number {
    const result = zxcvbn(password);
    return result.score;
  }

  /**
   * this will return the password strength score with feedback messages
   * return type { score: number; feedback: { suggestions: string[]; warning: string } }
   *
   * @param password - Password
   */
  scoreWithFeedback(password: string): {
    score: number;
    feedback: { suggestions: string[]; warning: any };
  } {
    const result = zxcvbn(password);
    return { score: result.score, feedback: result.feedback };
  }
}
