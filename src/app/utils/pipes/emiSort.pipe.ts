import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({ name: "sortByEMIMonths" })
export class SortByEMIMonthsPipe implements PipeTransform
{
    transform(emiPlans: any[]): any[]
    {
        emiPlans.sort((emi1, emi2) =>
        {
            const emiKey1 = parseInt((emi1.key as string).split(/(\d+)/)[1]);
            const emiKey2 = parseInt((emi2.key as string).split(/(\d+)/)[1]);
            return emiKey1 > emiKey2 ? 1 : -1;
        });
        return emiPlans;
    }
}

@NgModule({
    declarations: [SortByEMIMonthsPipe],
    exports: [SortByEMIMonthsPipe],
    providers: [SortByEMIMonthsPipe,]
})
export class SortByEMIMonthsPipeModule { }
