import { Component, Input, PLATFORM_ID, Inject} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

declare var $: any;

@Component({
    selector: 'paytm-upi-form',
    templateUrl: './paytmUpiForm.html',
})
export class PaytmUpiFormComponent{

    @Input() data:{} = {};
    isServer: boolean;
    isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) private platformId: Object){
        this.isServer = isPlatformServer(this.platformId);
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit(){
        
    }

    ngAfterViewInit(){
        
        setTimeout(()=>{
            if(this.isBrowser && document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed"; 
            if(this.isBrowser && (<HTMLFormElement>document.getElementById( "paytm_upi_form" )))
                (<HTMLFormElement>document.getElementById( "paytm_upi_form" )).submit();
        }, 200);
    }

    doPayment(){
        if(this.isBrowser){
            if(document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed"; 
            if(<HTMLFormElement>document.getElementById( "paytm_upi_form" ))
                (<HTMLFormElement>document.getElementById( "paytm_upi_form" )).submit();
        }
    }
}