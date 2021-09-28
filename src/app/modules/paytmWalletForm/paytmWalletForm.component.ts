import { Component, Input } from '@angular/core';

@Component({
    selector: 'paytm-wallet-form',
    templateUrl: './paytmWalletForm.html',
})

export class PaytmWalletFormComponent {

    @Input() data: {} = {};

    ngOnInit() {
    }

    ngAfterViewInit() {
        //console.log("ngAfterViewInit Called")
        //console.log("Do Payment");
        setTimeout(() => {
            if (document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed";
            (<HTMLFormElement>document.getElementById("paytm_wallet_form")).submit();
            //   $('.do-payment').html("changed");
            //   $( "#paytm_wallet_form" ).submit();
        }, 200)
    }

    doPayment() {
        if (document.querySelector('.do-payment'))
            document.querySelector('.do-payment').innerHTML = "changed";
        (<HTMLFormElement>document.getElementById("paytm_wallet_form")).submit();
        // $('.do-payment').html("changed");
        // $( "#paytm_wallet_form" ).submit();
    }
}
