import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs/Subject';

import { PromoOfferService } from './promo-offer.service';
import { cartSession } from '../../utils/models/cart.initial';

declare let dataLayer: any;

@Component({
    selector: 'app-promo-offer',
    templateUrl: './promo-offer.component.html',
    styleUrls: ['./promo-offer.component.scss']
})
export class PromoOfferComponent implements OnInit {

    allPromoCodes: Array<any> = [];
    @Input() iData: { text: string, pcd: {}};
    private currentGetAllPromoCodesByUserId: any;
    @Output() closePopup$: EventEmitter<boolean>;
    updatePromo$: Subject<string> = new Subject<string>();
    @Output() updateCartSession$: EventEmitter<{}>;
    @Output() outData$: EventEmitter<{}>;
    constructor(private _pos: PromoOfferService, private _lss: LocalStorageService) {
        this.updateCartSession$ = new EventEmitter();
        this.closePopup$ = new EventEmitter();
        this.outData$ = new EventEmitter();
    }

    ngOnInit() {
        this.getAllPromoCodesByUserId();
    }

    setPromoCode(item) {
        this.updatePromo$.next(item.promoCode);
    }

    getAllPromoCodes() {
        this._pos.getAllPromoCodes().subscribe(res => {

            if (res['statusCode'] === 200) {
                this.allPromoCodes = res['data'];

                const dlp = [];
                for (let p = 0; p < this.allPromoCodes.length; p++) {
                    const promo = {
                        id: this.allPromoCodes[p]['promoId'],
                        name: this.allPromoCodes[p]['promoCode'],
                        'creative': 'banner1',
                        'position': 'slot1'
                    };
                    dlp.push(promo);
                }

                setTimeout(() => {
                    for (let i = 0; i < dataLayer.length; i++) {
                        // console.log(dataLayer[i]['event']);
                        if (dataLayer[i]['event'] !== undefined && dataLayer[i]['event'] === 'promo- impressions') {
                            dataLayer.splice(i, 1);
                        }
                        // console.log(dataLayer[i]['event']);
                    }
                    dataLayer.push({
                        'event': 'promo- impressions',
                        'ecommerce': {
                            'promoView': {
                                'promotions': dlp
                            }
                        }
                    });
                }, 3000);
                setTimeout(()=>{
                    document.querySelector('app-promo-offer').classList.add('open');
                    if (document.getElementsByClassName('open').length === 1) {
                        (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                        this.disableScroll();
                    }
                    const className = document.getElementsByClassName('content-popup');
                    for (let i = 0; i < className.length; i++) {
                        className[i].addEventListener('touchmove', this.propagation , {passive: true});
                    }
                },0);
            }
        });
    }

    getAllPromoCodesByUserId() {
        if (this._lss.retrieve('user')) {
            const userData = this._lss.retrieve('user');
            if (userData.authenticated === 'true') {
                if (this.currentGetAllPromoCodesByUserId !== undefined) {
                    this.currentGetAllPromoCodesByUserId.unsubscribe();
                }

                this.currentGetAllPromoCodesByUserId = this._pos.getAllPromoCodesByUserId(userData.userId).subscribe(res => {

                    if (res['statusCode'] === 200) {
                        this.allPromoCodes = res['data'];

                        // console.log("Measuring Promotions", this.allPromoCodes);

                        setTimeout(() => {
                            const dlp = [];
                            for (let p = 0; p < this.allPromoCodes.length; p++) {
                                const promo = {
                                    id: this.allPromoCodes[p]['promoId'],
                                    name: this.allPromoCodes[p]['promoCode'],
                                    'creative': 'banner1',
                                    'position': 'slot1'
                                };
                                dlp.push(promo);
                            }

                            dataLayer.push({
                                'event': 'promo- impressions',
                                'ecommerce': {
                                    'promoView': {
                                        'promotions': dlp
                                    }
                                }
                            });
                        }, 3000);
                        setTimeout(()=>{
                            document.querySelector('app-promo-offer').classList.add('open');
                            if (document.getElementsByClassName('open').length === 1) {
                                (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                                this.disableScroll();
                            }
                            const className = document.getElementsByClassName('content-popup');
                            for (let i = 0; i < className.length; i++) {
                                className[i].addEventListener('touchmove', this.propagation , {passive: true});
                            }
                        },0);
                    }
                });
            } else {
                this.getAllPromoCodes();
            }
        } else {
            this.getAllPromoCodes();
        }
    }
    preventDefault(e) {
        e.preventDefault();
    }
    propagation(e) {
        e.stopPropagation();
    }
    disableScroll() {
        document.getElementById('body').addEventListener('touchmove', this.preventDefault, { passive: true });
    }
    enableScroll() {
        document.getElementById('body').removeEventListener('touchmove', this.preventDefault);
    }
    closePopup() {
        document.querySelector('app-promo-offer').classList.remove('open');
        this.enableScroll();
        setTimeout(()=>{
            this.closePopup$.emit();
        }, 200);
    }

    updateCartSession(data: {cartSession?: {}}) {
        if (data && data.cartSession) {
            this.updateCartSession$.next(cartSession);
        }
    }

    outData(data: {}) {
        if (data && data['pcd']) {
            this.outData$.emit(data);
            this.closePopup();
        }
    }
}
