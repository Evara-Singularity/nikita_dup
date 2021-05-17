import {Pipe, PipeTransform,NgModule} from '@angular/core';
@Pipe({
    name: "mathCeil"
})
export class MathCeilPipe implements PipeTransform{
    transform(value: number): number {
        return Math.ceil(value);
    }
}
@NgModule({
    imports:[],
    exports:[MathCeilPipe],
    declarations:[MathCeilPipe],
    providers:[]
})

export class MathCeilPipeModule
{
   
}