import { AbstractControl, ValidationErrors } from '@angular/forms';
export class PasswordValidator
{
    static validatePassword(control: AbstractControl): ValidationErrors | null
    {
        let value: string = control.value;
        if (value.length == 0) {
            return { 'required': 'Please provide password.' }
        } else if (value.indexOf(' ') > -1) {
            return { 'space': 'Password cannot contain space.' }
        } else if (value.length > 0 && value.length < 8) {
            return { 'minlength': 'Password should be of min. 8 characters.' }
        }
        return null
    }
}