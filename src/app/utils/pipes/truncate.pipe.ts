import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({ name: "truncate" })
export class Truncate implements PipeTransform
{
    transform(value: string, truncate: number): any
    {
        if (!value) return "";
        return (value.length > truncate) ? `${value.slice(0, truncate)}...` : value;
    }
}
@NgModule({ declarations: [Truncate], exports: [Truncate], providers: [Truncate,] })
export class TruncatePipeModule { }