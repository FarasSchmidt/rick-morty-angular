import { finalize } from 'rxjs';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PasswordStrengthDirective } from "../../../directives/password-strength.directive";
import { getPasswordStrength } from '../../../utils/password-strength.util';
import { passwordsMatch, PasswordConfirmationErrorMatcher } from '../../../utils/password-confirmation';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    PasswordStrengthDirective
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  passwordStrength = '';
  passwordStrengthColor = '';
  confirmationMatcher = new PasswordConfirmationErrorMatcher();


  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
    confirmPassword: ['', [Validators.required, Validators.maxLength(128)]],
  }, { validators: passwordsMatch });

  ngOnInit(): void { }

  onInputPassword(value: string): void {
    const strength = getPasswordStrength(value);
    this.passwordStrength = strength.label;
    this.passwordStrengthColor = strength.color;
  }


  submitting = false;
  onSubmit(): void {
    if (this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Completá todos los campos correctamente.', 'Cerrar', { duration: 4000 });
      return;
    }
    this.submitting = true;
    const values = this.form.getRawValue();
    this.auth.register({ name: values.name!, email: values.email!, password: values.password! })
      .pipe(finalize(() => this.submitting = false)).subscribe({
        next: () => {
          this.form.controls.password.reset();
          this.form.controls.confirmPassword.reset();
          this.snackBar.open('Registro exitoso. Ahora podés iniciar sesión.', 'Cerrar', { duration: 4000 });
          this.router.navigate(['/login']);
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Cerrar', { duration: 5000 })
      });
  }
}
