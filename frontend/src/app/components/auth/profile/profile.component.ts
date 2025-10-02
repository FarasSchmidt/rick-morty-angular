import { Component, OnInit, inject } from '@angular/core';
import { AuthService, User } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PasswordStrengthDirective } from "../../../directives/password-strength.directive";
import { getPasswordStrength } from '../../../utils/password-strength.util';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    PasswordStrengthDirective
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  passwordStrength = '';
  passwordStrengthColor = '';
  deshabilitado = true

  form = this.fb.group({
    name: ['', Validators.required],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],

  });

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.form.patchValue(user);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.auth.update(this.form.getRawValue() as User);
      this.snackBar.open('Datos actualizados', 'Cerrar', { duration: 3000 });
    }
  }

  onInputPassword(value: string): void {
    const strength = getPasswordStrength(value);
    this.passwordStrength = strength.label;
    this.passwordStrengthColor = strength.color;
  }

  logout(): void {
    this.auth.logout();
    //this.snackBar.open('Sesión cerrada', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.snackBar.open('Sesión cerrada con exito', 'Cerrar', { duration: 3000 });
  }
}