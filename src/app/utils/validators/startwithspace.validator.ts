import { AbstractControl, ValidationErrors } from "@angular/forms";
export class StartWithSpaceValidator {
  static validateSpaceStart(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value;
    return value.startsWith(" ") ? { whitespace: true } : null;
  }
}