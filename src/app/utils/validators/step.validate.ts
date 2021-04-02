/**
 * Created by kuldeep on 12/6/17.
 */
import { FormControl } from '@angular/forms';


export class Step{
    static validateEmailOrPhone(c: FormControl) {
        //^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15}(.[a-zA-Z]{2,15})?)$
        let emailRegex = /^[a-zA-Z0-9]*([\._a-zA-Z0-9])*[a-zA-Z0-9]@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
        let phoneRegex = '^[1-9][0-9]{9}$';

        let error = null;

        if(c.value === null){
            error = { 'required': true };
            return error;
        }

        if(c.value.match(phoneRegex) != null){
            error = null;
            // return null;
        }else if(emailRegex.test(c.value)){
            error = null;
            // return null;
        }else{
            error = { 'invalidEmailOrPhone': true };
        }

        // console.log(error);
        return error;
    }

    static validateEmail(c: FormControl) {
        let emailRegex = /^[a-zA-Z0-9]*([\._a-zA-Z0-9])*[a-zA-Z0-9]@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
        if(c.value == null || c.value == ""){
            return null;
        }
        /*Check if user enter a phone number instead of email*/
        let email = c.value;
        if(emailRegex.test(email)){
            return null;
        }else{
            return { 'invalidEmail': true };
        }
    }

    static validatePhone(c: FormControl) {
        let phoneRegex = '^[1-9][0-9]{9}$';

        let error = null;

        if(c.value === null){
            error = { 'required': true };
            return error;
        }

        /*Check if user enter a phone number instead of email*/
        let phone = c.value.toString();
        if(phone.match(phoneRegex) != null){
            error = null;
        }else{
            error = { 'invalidPhone': true };
        }

        //console.log(error);
        return error;
    }

    static validatePostCode(c: FormControl) {
        let postCodeRegex = '^[1-9][0-9]{5}$';

        let error = null;

        if(c.value === null){
            error = { 'required': true };
            return error;
        }

        /*Check if user enter a phone number instead of email*/
        let phone = c.value.toString();
        if(phone.match(postCodeRegex) != null){
            error = null;
        }else{
            error = { 'invalidPostCode': true };
        }

        //console.log(error);
        return error;
    }

    static phoneExist(c: FormControl) {
         return { 'phoneExist': true };
    }

    static confirmPassword(c: FormControl){
        let error = null;
        if(c.value == undefined || c.value == null)
            return error;

        //console.log(c.root.get('newPassword'), c.root.get('step3').get('newPassword').value);
        if(c.root.get('step3').get('newPassword').value != null){
            // //console.log();
            let newPassword = c.root.get('step3').get('newPassword').value;
            if(newPassword == c.value){
                error = null;
            }else{
                error = { 'passwordNotMatch': true };
            }
        }
        //console.log(error);
        return error;
    }
}