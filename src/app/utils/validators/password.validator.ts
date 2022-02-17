import { AbstractControl, ValidationErrors } from '@angular/forms';
export class PasswordValidator
{
    static validatePassword(control: AbstractControl): ValidationErrors | null
    {
        let value: string = control.value;
        return PasswordValidator.validate(value);
    }

    static validateSignupPassword(control: AbstractControl): ValidationErrors | null
    {
        let value: string = control.value;
        if (value) { return PasswordValidator.validate(value); }
        return null;
    }

    static validate(value)
    {
        if(!(value)){
            return { 'minlength': 'Password should be of minimum 8 characters' };
        }
        else if (value.indexOf(' ') > -1) {
            return { 'space': 'Password cannot contain space' };
        } else if (value.length === 0 || value.length < 8) {
            return { 'minlength': 'Password should be of minimum 8 characters' };
        }
        return null;
    }


}