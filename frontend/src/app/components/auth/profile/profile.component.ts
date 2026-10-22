import { finalize } from 'rxjs';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PasswordStrengthDirective } from '../../../directives/password-strength.directive';
import { getPasswordStrength } from '../../../utils/password-strength.util';
import { passwordsMatch, PasswordConfirmationErrorMatcher } from '../../../utils/password-confirmation';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    PasswordStrengthDirective
],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  submitting = false;
  photoProcessing = false;
  photoError = '';
  profilePhoto = '';
  private photoRevision = 0;
  passwordStrength = '';
  passwordStrengthColor = '';
  confirmationMatcher = new PasswordConfirmationErrorMatcher();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(128)]],
    currentPassword: [''],
    confirmPassword: ['', Validators.maxLength(128)],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.form.patchValue(user);
      this.profilePhoto = user.profilePhoto ?? '';
      this.auth.loadProfile().subscribe({
        next: profile => { this.form.patchValue(profile); this.profilePhoto = profile.profilePhoto ?? ''; },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSave(): void {
    if (this.submitting || this.photoProcessing) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, password, currentPassword } = this.form.getRawValue();
    if ((password || currentPassword) && (!password || !currentPassword)) {
      this.snackBar.open('Completá la contraseña actual y la nueva para cambiarla.', 'Cerrar', { duration: 5000 });
      return;
    }
    this.submitting = true;
    this.auth.update({ name: name!.trim(), profilePhoto: this.profilePhoto, ...(password ? { newPassword: password, currentPassword: currentPassword! } : {}) })
      .pipe(finalize(() => this.submitting = false)).subscribe({
        next: user => {
          this.form.patchValue(user);
          this.form.controls.password.reset();
          this.form.controls.confirmPassword.reset();
          this.form.controls.currentPassword.reset();
          this.onInputPassword('');
          this.snackBar.open('Datos actualizados', 'Cerrar', { duration: 3000 });
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Cerrar', { duration: 5000 })
      });
  }

  async selectPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoError = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.photoError = 'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.';
      input.value = '';
      return;
    }
    const revision = ++this.photoRevision;
    this.photoProcessing = true;
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      const side = Math.min(image.width, image.height);
      context.fillStyle = '#2c2c2c';
      context.fillRect(0, 0, 256, 256);
      context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
      const photo = canvas.toDataURL('image/jpeg', 0.8);
      if (photo.length > 180000) throw new Error();
      if (revision === this.photoRevision) this.profilePhoto = photo;
    } catch {
      if (revision === this.photoRevision) this.photoError = 'No pudimos procesar esa foto. Probá con otra imagen.';
    } finally {
      URL.revokeObjectURL(url);
      input.value = '';
      if (revision === this.photoRevision) this.photoProcessing = false;
    }
  }

  removePhoto(): void { this.photoRevision++; this.photoProcessing = false; this.profilePhoto = ''; this.photoError = ''; }

  onInputPassword(value: string): void {
    const strength = getPasswordStrength(value);
    this.passwordStrength = value ? strength.label : '';
    this.passwordStrengthColor = value ? strength.color : '';
  }

  logout(): void {
    this.auth.logout();
    this.snackBar.open('Sesión cerrada', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/login']);
  }
}
