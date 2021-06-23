import { Pipe, PipeTransform, NgModule, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
declare var $: any;
@Pipe({
    name: "oosValitionMessage"
})
export class OutOfStockValidationMessage implements PipeTransform {
    isServer: boolean;
    isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId,) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }
    transform(value: any, fallback: string = null): any {
        //  ;
        let oosMessage = [];
        let isOOS = false;
        let isUnservicable = false;
        // below msnlist is just for checking is any ms
        const msnList = [];
        const itemsValidationMessage = value.filter((ivm) => {
            if (ivm['type'] != 'oos' && ivm['type'] != 'unservicable') {
                return true;
            }

            if (ivm['type'] == 'oos') {
                isOOS = true;
            } else if (ivm['type'] == 'unservicable') {
                isUnservicable = true;
            }

            if (!oosMessage.length) {
                oosMessage.push(ivm);
                oosMessage[0]['count'] = 1;

            } else {
                if (msnList.indexOf(ivm['msnid']) == -1) {
                    let count = oosMessage[0]['count'];
                    oosMessage[0]['count'] = count + 1;
                }
            }

            msnList.push(ivm['msnid']);

            return false;
        });
        //    console.log(itemsValidationMessage);
        if (isOOS) {
            let text1 = oosMessage[0]['count'] > 1 ? "Items in your cart are" : "Item in your cart is";
            text1 = text1 + " not available for order currently";
            if (isUnservicable) {
                text1 = text1 + " or not deliverable at the selected shipping address";
            }
            oosMessage[0]['data']['text1'] = text1;
        } else if (isUnservicable) {
            let text1 = oosMessage[0]['count'] > 1 ? "Items in your cart are" : "Item in your cart is";
            text1 = text1 + " not deliverable at the selected shipping address";
            oosMessage[0]['data']['text1'] = text1;
        }
        return [...oosMessage, ...itemsValidationMessage];
    }
}

@NgModule(
    {
        declarations: [OutOfStockValidationMessage],
        exports: [OutOfStockValidationMessage],
        providers: [
            OutOfStockValidationMessage,
        ]
    }
)

export class OutOfStockValidationMessagePipeModule {

}
