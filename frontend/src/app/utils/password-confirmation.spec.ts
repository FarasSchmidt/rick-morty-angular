import { FormControl, FormGroup } from '@angular/forms';
import { passwordsMatch, PasswordConfirmationErrorMatcher } from './password-confirmation';

describe('Password confirmation', () => {
  it('allows an unchanged profile and revalidates when either password changes', () => {
    const form = new FormGroup({ password: new FormControl(''), confirmPassword: new FormControl('') }, passwordsMatch);
    expect(form.valid).toBeTrue();
    form.controls.password.setValue('example123');
    expect(form.hasError('passwordMismatch')).toBeTrue();
    form.controls.confirmPassword.setValue('example123');
    expect(form.valid).toBeTrue();
    form.controls.password.setValue('different123');
    expect(form.hasError('passwordMismatch')).toBeTrue();
  });

  it('shows a mismatch only after interacting with the confirmation', () => {
    const form = new FormGroup({ password: new FormControl('example123'), confirmPassword: new FormControl('other123') }, passwordsMatch);
    const matcher = new PasswordConfirmationErrorMatcher();
    expect(matcher.isErrorState(form.controls.confirmPassword, null)).toBeFalse();
    form.controls.confirmPassword.markAsTouched();
    expect(matcher.isErrorState(form.controls.confirmPassword, null)).toBeTrue();
    form.controls.confirmPassword.setValue('example123');
    expect(matcher.isErrorState(form.controls.confirmPassword, null)).toBeFalse();
  });
});
