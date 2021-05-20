import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arraysort'
})

export class ArraySortPipe implements PipeTransform {
    transform(value: Array<any>, ...args: any[]): any {
        return value.sort((a, b) => {

            const nameA = a.key.toUpperCase(); // ignore upper and lowercase
            const nameB = b.key.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        });
    }
}

import { NgModule } from '@angular/core';

//import {from './name.component';

@NgModule({
    imports: [],
    exports: [ArraySortPipe],
    declarations: [ArraySortPipe],
    providers: [],
})
export class ArraySortPipeModule { }
