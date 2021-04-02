import {Pipe, PipeTransform,NgModule} from '@angular/core';
@Pipe({
    name: "mathFloor"
})
export class MathFloorPipe implements PipeTransform{
    transform(value: number): number {
        return Math.floor(value);
    }
}
@NgModule({
    imports:[],
    exports:[MathFloorPipe],
    declarations:[MathFloorPipe],
    providers:[]
})

export class MathFloorPipeModule
{
   
}