import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusTranslate',
  standalone: true
})
export class StatusTranslatePipe implements PipeTransform {
  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'alive':
        return 'Vivo';
      case 'dead':
        return 'Muerto';
      default:
        return 'Desconocido';
    }
  }
}
