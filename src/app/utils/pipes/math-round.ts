import {Pipe, PipeTransform,NgModule} from '@angular/core';
@Pipe({
    name: "mathRound"
})
export class MathRoundPipe implements PipeTransform{
    transform(value: number): number {
        return Math.round(value);
    }
}
@NgModule({
    imports:[],
    exports:[MathRoundPipe],
    declarations:[MathRoundPipe],
    providers:[]
})

export class MathRoundPipeModule
{
   
}