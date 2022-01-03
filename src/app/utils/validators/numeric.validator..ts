import { AbstractControl, ValidationErrors } from "@angular/forms";

export class NumericValidator {
  static validateNumber(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value;
    if(value){
        let flag = value.includes(".") || value.includes("-") || value.startsWith("0");
        let numeric = !(parseInt(value));
        return (flag || numeric) ? { notnumeric: true } : null;
    }
    return null;
  }
}