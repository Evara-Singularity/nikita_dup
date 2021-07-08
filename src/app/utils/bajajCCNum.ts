import { AbstractControl, ValidationErrors } from '@angular/forms';
const error = { 'ccmessage': 'Please enter valid card number.' };
const numericPatt = /^[0-9]\d*$/;
const startsPatt = /^203040[0-9]*$/;
export class Bajaj_CCNumValidator
{
    static validateCCNumber(control: AbstractControl): ValidationErrors | null
    {
        let ccNum: string = control.value;
        if (ccNum && (ccNum.length != 16 || !(numericPatt.test(ccNum)) || !(startsPatt.test(ccNum)))) {
            return error;
        }
        return null;
    }
}