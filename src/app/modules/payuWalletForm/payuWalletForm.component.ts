import { Component, Input } from '@angular/core';

@Component({
    selector: 'payu-wallet-form',
    templateUrl: './payuWalletForm.html',
})

export class PayuWalletFormComponent{

    @Input() data:{} = {};

    ngOnInit(){

    }

    ngAfterViewInit(){
        //console.log("ngAfterViewInit Called")
        //console.log("Do Payment");
        setTimeout(()=>{
            if(document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed"; 
            (<HTMLFormElement>document.getElementById( "payu_wallet_form" )).submit();
            // $('.do-payment').html("changed");
            // $( "#payu_wallet_form" ).submit();
        }, 200);
        //$('.do-payment').html("changed");
        //$( "#payu_wallet_form" ).submit();
    }

    doPayment(){
        if(document.querySelector('.do-payment'))
            document.querySelector('.do-payment').innerHTML = "changed"; 
        (<HTMLFormElement>document.getElementById( "payu_wallet_form" )).submit();
        // $('.do-payment').html("changed");
        // $( "#payu_wallet_form" ).submit();
    }
}