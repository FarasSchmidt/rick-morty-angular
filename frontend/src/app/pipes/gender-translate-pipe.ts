import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genderTranslate',
  standalone: true
})
export class GenderTranslatePipe implements PipeTransform {
  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Femenino';
      case 'genderless':
        return 'Sin género';
      default:
        return 'Desconocido';
    }
  }
}
