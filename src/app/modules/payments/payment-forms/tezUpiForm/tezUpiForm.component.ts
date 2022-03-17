import { Component, Input } from '@angular/core';

@Component({
    selector: 'tez-upi-form',
    templateUrl: './tezUpiForm.html',
})

export class TezUpiFormComponent {

    @Input() data: {} = {};

    ngOnInit() {

    }

    ngAfterViewInit() {

        setTimeout(() => {
            if (document.querySelector('.do-payment'))
                document.querySelector('.do-payment').innerHTML = "changed";
            (<HTMLFormElement>document.getElementById("tez_upi_form")).submit();
        }, 200);
    }

    doPayment() {
        if (document.querySelector('.do-payment'))
            document.querySelector('.do-payment').innerHTML = "changed";
        (<HTMLFormElement>document.getElementById("tez_upi_form")).submit();

    }
}