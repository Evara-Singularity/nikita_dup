import { Component, Input, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'mobikwik-wallet-form',
    templateUrl: './mobikwikWalletForm.html',
})

export class MobikwikWalletFormComponent implements AfterViewInit {

    @Input() data: {};
    isServer: boolean;
    isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId) {
        this.data = {};
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
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
