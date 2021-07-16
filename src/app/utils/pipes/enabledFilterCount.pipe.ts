import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'enabledFilter'
})

export class EnabledFilterPipe implements PipeTransform {
    transform(value: Array<any>, ...args: any[]): any {
        let count = 0;
        if (value) {
            value.forEach(v =>{
                if(v.selected) {
                    count++;
                }
            });
            return count;
        }
        return count;
    }
}

import { NgModule } from '@angular/core';

//import {from './name.component';

@NgModule({
    exports: [EnabledFilterPipe],
    declarations: [EnabledFilterPipe],
    providers: [],
})
export class EnabledFilterPipeModule { }
