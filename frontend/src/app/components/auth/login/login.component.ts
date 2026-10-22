import { finalize } from 'rxjs';
import { Component, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule
],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  submitting = false;
  slowRequest = false;
  private slowTimer?: ReturnType<typeof setTimeout>;
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.slowTimer));
  }
  onSubmit(): void {
    if (this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Completá todos los campos correctamente.', 'Cerrar', { duration: 4000 });
      return;
    }
    this.submitting = true;
    this.slowRequest = false;
    this.slowTimer = setTimeout(() => this.slowRequest = true, 8000);
    const values = this.form.getRawValue();
    this.auth.login(values.email!, values.password!)
      .pipe(finalize(() => {
        clearTimeout(this.slowTimer);
        this.submitting = false;
        this.slowRequest = false;
      })).subscribe({
        next: () => {
          this.form.controls.password.reset();
          this.snackBar.open('Inicio de sesión exitoso.', 'Cerrar', { duration: 4000 });
          this.router.navigate(['/characters']);
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Cerrar', { duration: 5000 })
      });
  }
}
