import { Component, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'payu-form',
    templateUrl: './payuForm.html',
})

export class PayuFormComponent{
    configApi:{};
    @Input() data:{} = {};
    constructor(){
        this.configApi = CONSTANTS;
    }

    ngOnInit(){
        
    }

    ngAfterViewInit(){
        setTimeout(()=>{
            if(document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed"; 
            (<HTMLFormElement>document.getElementById( "payu_form" )).submit();
        }, 200)
    }

    doPayment(){
        if(document.querySelector('.do-payment'))
            document.querySelector('.do-payment').innerHTML = "changed"; 
        (<HTMLFormElement>document.getElementById( "payu_form" )).submit();
    }
}