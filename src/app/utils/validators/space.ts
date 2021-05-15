import { AbstractControl, ValidationErrors } from "@angular/forms";
const error = { spaceError: "cannot contains space." };
export class SpaceValidator {
  static validateSpace(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value;
    return value && value.indexOf(" ") > -1 ? error : null;
  }
}