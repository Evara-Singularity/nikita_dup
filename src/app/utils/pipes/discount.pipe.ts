import { Pipe, PipeTransform, NgModule } from '@angular/core';
const off = '% OFF';
@Pipe({
    name: 'discount'
})
export class DiscountPipe implements PipeTransform {
    transform(product: any): any {
        let mrp = product.mrp;
        let calculated = (mrp - product.priceWithoutTax) / mrp;
        let retValue = calculated * 100;
        return Math.floor(retValue) + off;
    }
}

@NgModule({
    imports: [],
    exports: [DiscountPipe],
    declarations: [DiscountPipe],
    providers: [],
})
export class DiscountPipeModule { }