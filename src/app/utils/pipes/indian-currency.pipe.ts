import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({ name: "indianCurrency" })

export class IndianCurrencyPipe implements PipeTransform
{
    transform(value: number | string)
    {
        if (!value) return "00.00";
        return Number(value).toLocaleString('en-IN');
    }
}
@NgModule({
    imports: [],
    exports: [IndianCurrencyPipe],
    declarations: [IndianCurrencyPipe],
    providers: []
})

export class IndianCurrencyPipeModule { }