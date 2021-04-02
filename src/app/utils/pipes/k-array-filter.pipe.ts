import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayFilterPipe'
})

export class ArrayFilterPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {

        if(value == undefined){
            return value;
        }

        //For object
        if(args.indexOf('object') !== -1){
            value = value.filter((item)=>{
                if(item[args[0]] == args[1]){
                    return true;
                }
                return false;
            });
            return value;
        }else{

        }        

        return value;
    }
}

import { NgModule } from '@angular/core';

// import { NameComponent } from './name.component';

@NgModule({
    imports: [],
    exports: [ArrayFilterPipe],
    declarations: [ArrayFilterPipe],
    providers: [],
})
export class ArrayFilterPipeModule { }


