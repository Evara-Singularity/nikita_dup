import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
    name: "productInfoSection"
})
export class ProductInfoSection implements PipeTransform
{
    transform(product: any): string
    {
        let returnValue = null;
        if (product['productKeyFeatures'] && product['productKeyFeatures'].length) {
            returnValue = 'features';
        }
        else if (product['productAttributes']) {
            returnValue = 'specifications';
        }
        else if (product.productDescripton){
            returnValue = 'details'
        }
        return returnValue;
    }
}

@NgModule(
    {
        declarations: [ProductInfoSection],
        exports: [ProductInfoSection],
        providers: [ProductInfoSection,]
    }
)

export class ProductInfoSectionPipeModule { }