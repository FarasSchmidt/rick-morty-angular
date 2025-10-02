import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { getPasswordStrength } from '../utils/password-strength.util';

@Directive({
  selector: '[appPasswordStrength]',
  standalone: true,
})
export class PasswordStrengthDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('input') onInput() {
    const password = this.el.nativeElement.value;
    const { color } = getPasswordStrength(password);
    this.renderer.setStyle(this.el.nativeElement, 'border-color', color);
  }
}
