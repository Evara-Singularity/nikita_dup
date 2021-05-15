import { Pipe, PipeTransform,NgModule } from '@angular/core';
const errorsList = {
    'required':'Pincode cannot be empty',
    'spaceError':'Pincode cannot contain spaces',
    'minlength': 'Pincode should be of 6 characters',
    'invalidPostCode':'Kindly enter valid pincode'
}
@Pipe({
    name: 'pincodeerror'
})
export class PincodePipe implements PipeTransform {
    transform(errors: any): any {
        if(errors){
            let errorKeys:string[] = Object.keys(errors);
            if(errorKeys.indexOf('required')>-1){
                return errorsList.required;
            }else if(errorKeys.indexOf('spaceError')>-1){
                return errorsList.spaceError;
            }else if(errorKeys.indexOf('minlength')>-1){
                return errorsList.minlength;
            }else if(errorKeys.indexOf('invalidPostCode')>-1){
                return errorsList.invalidPostCode;
            }
        }
        return '';
    }
}

@NgModule({
    imports: [],
    exports: [PincodePipe],
    declarations: [PincodePipe],
    providers: [],
})
export class PincodePipeModule { }


