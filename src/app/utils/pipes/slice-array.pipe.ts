import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({ name: "sliceArray" })
export class SliceArrayPipe implements PipeTransform
{
    transform(list: any[], limit: number): any
    {
        if (list && list.length && limit) {
            return list.slice(0, limit);
        }
        return [];
    }
}

@NgModule(
    {
        declarations: [SliceArrayPipe],
        exports: [SliceArrayPipe],
        providers: [SliceArrayPipe,]
    }
)

export class SliceArrayPipeModule { }