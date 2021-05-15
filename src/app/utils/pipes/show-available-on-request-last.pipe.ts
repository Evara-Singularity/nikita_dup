/**
 * Created by Kuldeep on 17/5/17.
 */

import { Pipe, PipeTransform, NgModule } from '@angular/core'
@Pipe({
    name: "showAvailableOnRequestLast"
})
export class ShowAvailableOnRequestLast implements PipeTransform {
    transform(value: Array<{}>, fallback?: string): any {
        let rArray = [];
        let inStockProducts=[];
        let oosProducts = [];
        for (let i=0; i<value.length; i++) {
            if(value[i]["quantityAvailable"]>0 && value[i]["salesPrice"] > 0)
                inStockProducts.push(value[i]);
            else
                oosProducts.push(value[i]);
        }
        rArray = inStockProducts.concat(oosProducts);
        return rArray;
    }
}

@NgModule(
    {
        declarations: [ShowAvailableOnRequestLast],
        exports:[ShowAvailableOnRequestLast],
        providers: [
            ShowAvailableOnRequestLast,
        ]
    }
)

export class ShowAvailableOnRequestLastPipeModule {

}