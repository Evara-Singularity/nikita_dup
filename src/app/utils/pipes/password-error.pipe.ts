import { Pipe, PipeTransform,NgModule } from '@angular/core';
const errorsList = {
    'required':'Password cannot be empty',
    'spaceError':'Password cannot contain spaces',
    'minlength': 'Password should be of min. 8 characters'
}
@Pipe({
    name: 'passworderror'
})
export class PasswordPipe implements PipeTransform {
    transform(errors: any): any {
        if(errors){
            let errorKeys:string[] = Object.keys(errors);
            if(errorKeys.indexOf('required')>-1){
                return errorsList.required;
            }else if(errorKeys.indexOf('spaceError')>-1 || errorKeys.indexOf('pattern')>-1){
                return errorsList.spaceError;
            }else if(errorKeys.indexOf('minlength')>-1){
                return errorsList.minlength;
            }
        }
        return '';
    }
}

@NgModule({
    imports: [],
    exports: [PasswordPipe],
    declarations: [PasswordPipe],
    providers: [],
})
export class PasswordPipeModule { }


