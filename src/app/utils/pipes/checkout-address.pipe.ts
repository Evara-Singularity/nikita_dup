import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({ name: "checkoutAddress" })
export class CheckoutAddress implements PipeTransform
{
    transform(address: string): any
    {
        const combined = [];
        if (address['addressLine'] !== undefined) {
            combined.push(address['addressLine']);
        }
        if (address['city'] !== undefined) {
            combined.push(address['city']);
        }
        if (address['state'] !== undefined && address['state']['name'] !== undefined) {
            combined.push(address['state']['name']);
        }
        if (address['country'] !== undefined && address['country']['name'] !== undefined) {
            combined.push(address['country']['name']);
        }
        return combined.join(', ') + ' - ' + address['postCode'];
    }
}

@NgModule({ declarations: [CheckoutAddress], exports: [CheckoutAddress], providers: [CheckoutAddress,] })
export class CheckoutAddressPipeModule { }