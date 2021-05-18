import { Pipe, PipeTransform, NgModule, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
declare let $: any;


@Pipe({
    name: "addRupaySymbol"
})
export class AddRupaySymbol implements PipeTransform {
    isServer: boolean;
    isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId,){
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }
    transform(value: string, fallback: string): any {
        if (fallback != undefined && fallback != null && fallback.toLowerCase() == 'price') {
            let price;
            let rupeSymbol = '<i class="fa fa-inr" aria-hidden="true">&#x20b9</i> ';
            price = value.split('-');
            ////console.log(price[0], price[1]);
            let rData = '';
            rData = rupeSymbol+price[0].trim()+" - ";
            if(price[1].trim()=="*")
                rupeSymbol="";
            rData = rData+rupeSymbol+price[1].trim();
            if(this.isBrowser){
                if(document.querySelector('filter  ul li input:disabled + span i')){
                    document.querySelector('filter  ul li input:disabled + span i').classList.add('text-lightgrey');
                }
                if(document.querySelector('filter  ul li .disbled i.fa-inr')){
                    document.querySelector('filter  ul li .disbled i.fa-inr').classList.add('text-lightgrey');
                }
            }
            return rData;
        }else{
            return value;
        }
    }
}

@NgModule(
    {
        declarations: [AddRupaySymbol],
        exports:[AddRupaySymbol],
        providers: [
            AddRupaySymbol,
        ]
    }
)

export class AddRupaySymbolPipeModule {

}
