import type { FormControl, FormGroupDirective, NgForm, ValidatorFn } from '@angular/forms';
import type { ErrorStateMatcher } from '@angular/material/core';

export const passwordsMatch: ValidatorFn = form => {
  const password = form.get('password')?.value ?? '';
  const confirmation = form.get('confirmPassword')?.value ?? '';
  return password === confirmation ? null : { passwordMismatch: true };
};

export class PasswordConfirmationErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalid = !!(control?.invalid || control?.parent?.hasError('passwordMismatch'));
    return invalid && !!(control?.touched || form?.submitted);
  }
}
