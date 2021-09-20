import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'mobikwik-wallet-form',
    templateUrl: './mobikwikWalletForm.html',
})

export class MobikwikWalletFormComponent implements AfterViewInit {

    @Input() data: {};
    isServer: boolean;
    isBrowser: boolean;

    constructor(public _commonService: CommonService) {
        this.data = {};
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            setTimeout(() => {
                if (document.querySelector('.do-payment')) {
                    document.querySelector('.do-payment').innerHTML = 'changed';
                }
                (<HTMLFormElement>document.getElementById('mobikwik_wallet_form')).submit();
            }, 200);
        }
    }

    doPayment() {
        if (this.isBrowser) {
            if (document.querySelector('.do-payment')) {
                document.querySelector('.do-payment').innerHTML = 'changed';
            }
        }

        (<HTMLFormElement>document.getElementById('mobikwik_wallet_form')).submit();
    }
}
