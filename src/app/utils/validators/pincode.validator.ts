import { AbstractControl, ValidationErrors } from '@angular/forms';
const errors = { 
    'required': 'Kindly enter your pincode.' ,
    'length': 'Pincode should contain 6 characters.' ,
    'numeric': 'Pincode should contain only digits.' ,
};
export class PincodeValidator
{
    static validatePincode(control: AbstractControl): ValidationErrors | null
    {
        let value:string = control.value;
        let pattern  = /^[0-9]*$/;
        if(value.length == 0){
            return {message:errors.required};
        }else if(!pattern.test(value)){
            return {message:errors.numeric};
        }else if(value.length <6 || value.length >6 ){
            return {message:errors.length};
        }
        return null;
    }
}