import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PasswordStrengthDirective } from "../../../directives/password-strength.directive";
import { getPasswordStrength } from '../../../utils/password-strength.util';


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


  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void { }

  onInputPassword(value: string): void {
    const strength = getPasswordStrength(value);
    this.passwordStrength = strength.label;
    this.passwordStrengthColor = strength.color;
  }


  onSubmit(): void {
    if (this.form.valid) {
      const success = this.auth.register(this.form.value as User);
      if (success) {
        this.snackBar.open('Registro exitoso', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/characters']);
      } else {
        this.snackBar.open('Ese correo ya está registrado', 'Cerrar', { duration: 3000 });
      }
    }
  }


}
