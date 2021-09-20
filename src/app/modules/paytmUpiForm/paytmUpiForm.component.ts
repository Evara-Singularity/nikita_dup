import { Component, Input } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

declare var $: any;

@Component({
    selector: 'paytm-upi-form',
    templateUrl: './paytmUpiForm.html',
})
export class PaytmUpiFormComponent{

    @Input() data:{} = {};
    isServer: boolean;
    isBrowser: boolean;
    constructor(public _commonService: CommonService){
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
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