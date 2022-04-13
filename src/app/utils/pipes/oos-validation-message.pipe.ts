import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonService } from '../services/common.service';
declare var $: any;
@Pipe({
    name: "oosValitionMessage"
})
export class OutOfStockValidationMessage implements PipeTransform {
    isServer: boolean;
    isBrowser: boolean;

    constructor(public _commonService: CommonService) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }
    transform(value: any, fallback: string = null): any {
        //  ;
        let oosMessage = [];
        let isOOS = false;
        let isUnserviceable = false;
        // below msnlist is just for checking is any ms
        const msnList = [];
        const itemsValidationMessage = value.filter((ivm) => {
            if (ivm['type'] != 'oos' && ivm['type'] != 'unserviceable') {
                return true;
            }

            if (ivm['type'] == 'oos') {
                isOOS = true;
            } else if (ivm['type'] == 'unserviceable') {
                isUnserviceable = true;
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
            if (isUnserviceable) {
                text1 = text1 + " or not deliverable at the selected shipping address";
            }
            oosMessage[0]['data']['text1'] = text1;
        } else if (isUnserviceable) {
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
