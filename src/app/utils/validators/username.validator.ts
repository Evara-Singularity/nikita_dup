import { AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
const error = { 'spaceError': 'cannot contains space.' };
export class UsernameValidator
{
    static validateUsername(control: AbstractControl): ValidationErrors | null
    {
        let returnValue = null;
        let value: string = control.value?control.value:'';
        length = value.length;
        let numericValidation = /^\d*$/.test(value);
        let emailvalidation = /^[a-zA-Z0-9]*([\._a-zA-Z0-9])*[a-zA-Z0-9]@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/.test(value);
        if (length == 0) {
            returnValue = { requiredError: 'Please provide Email ID/Mobile Number.' };
        }else{
            if (numericValidation === true ){                
                if ( (length > 9 && length !== 10 ) || value.startsWith('0')){
                    returnValue = { phoneError: 'Please provide valid Mobile Number.' };
                }
                if ( (length < 10 ) || value.startsWith('0')){  
                    returnValue = { phoneError: 'Please provide valid Mobile Number.' };
                }
            }else{
                if (emailvalidation === false) {
                    returnValue = { emailError: 'Please provide valid Email Id.' };
                }
            }
        }
        return returnValue;
    }

    static validateEmailOrPhone(c: FormControl)
    {
        let emailRegex = /^[a-zA-Z0-9]*([\._a-zA-Z0-9])*[a-zA-Z0-9]@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
        let phoneRegex = '^[1-9][0-9]{9}$';
        let error = null;
        if (c.value === null) {
            error = { 'required': true };
            return error;
        }
        if (c.value.match(phoneRegex) != null) {
            error = null;
        } else if (emailRegex.test(c.value)) {
            error = null;
        } else {
            error = { 'invalidEmailOrPhone': true };
        }
        return error;
    }

    static validateEmail(c: FormControl)
    {
        let emailRegex = /^[a-zA-Z0-9]*([\._a-zA-Z0-9])*[a-zA-Z0-9]@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
        if(c.value) {
            let email = c.value;
            if (emailRegex.test(email)) {
                return null;
            } else {
                return { 'invalidCharT': true };
            }
        }
        return null;
    }

    static validatePhone(c: FormControl)
    {
        let phoneRegex = '^[1-9][0-9]{9}$';
        let error = null;
        if (c.value === null) {
            error = { 'required': true };
            return error;
        }
        let phone = c.value;
        if((phone as string).startsWith("0")){
            error = { 'startwithzero': true };
            return error;
        }
        if (phone.match(phoneRegex) != null) {
            error = null;
        } else {
            error = { 'invalidPhone': true };
        }
        return error;
    }

    static phoneExist(c: FormControl)
    {
        return { 'phoneExist': true };
    }

    static confirmPassword(c: FormControl)
    {
        let error = null;
        if (c.value == undefined || c.value == null)
            return error;
        if (c.root.get('step3').get('newPassword').value != null) {
            let newPassword = c.root.get('step3').get('newPassword').value;
            if (newPassword == c.value) {
                error = null;
            } else {
                error = { 'passwordNotMatch': true };
            }
        }
        return error;
    }
}