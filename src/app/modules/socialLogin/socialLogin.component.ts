import {Component, EventEmitter, Output, PLATFORM_ID, Inject} from '@angular/core';
import {SocialLoginService} from './socialLogin.service';
import { AuthService } from 'angular2-social-login';
import {ActivatedRoute, Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators';

import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { CartService } from '../../utils/services/cart.service';

declare let dataLayer: any;

@Component({
    selector: 'social-login',
    templateUrl: 'socialLogin.html',
    styleUrls: [
        './socialLogin.scss'
    ],
    // encapsulation: ViewEncapsulation.None
})

export class SocialLoginComponent {

    sub: any;
    isServer: boolean;
    isBrowser: boolean;
    redirectUrl: string;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    @Output() slWorking$: EventEmitter<any> = new EventEmitter<any>();
    constructor(private _commonService: CommonService, private _router: Router,
        private activatedRoute: ActivatedRoute, private _cartService: CartService,
        private _localAuthService: LocalAuthService, private socialLoginService: SocialLoginService,
        private _tms: ToastMessageService, 
        private _auth: AuthService, @Inject(PLATFORM_ID) platformId) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(){    
        this.activatedRoute.queryParams.subscribe(
            data=>
            {
                this.redirectUrl=data['backurl'];
            }
        );
    }

    ngAfterViewInit(){
    }

    signIn(provider){
        this.logout();
        this.sub = this._auth.login(provider).subscribe(
            (data) => {
                
                let params = {
                    phone: "",
                    email: data["email"],
                    token: data["token"],
                    firstName: data["name"],
                    lastName: "",
                    userId: data["uid"],
                    idToken: (data["idToken"]) ? data["idToken"] : '',
                    source: data["provider"],
                    buildVersion: '1.1' // for Login OTP for backed end tracking
                };

                this.socialLoginService.authenticate(params).subscribe((res)=>{
                    if(res["statusCode"] != undefined && res["statusCode"] == 500){//Invalid login
                        this.slWorking$.emit(true);
                        this.logout();
                    } else{
                        if(!this._cartService.buyNow){
                            this.slWorking$.emit(false);
                        }
                        this._localAuthService.setUserSession(res);

                        let td:any = new Date();
                        td.setHours(21, 0, 0);
                        td = td.getTime()/1000;
                        let nd:any = new Date();
                        nd.setHours(8, 0, 0);
                        nd.setDate(nd.getDate()+1);
                        nd = nd.getTime()/1000;                    
                        let cd:any = new Date();
                        cd.setHours(cd.getHours()+2);
                        cd = cd.getTime()/1000;                    

                        let NIGHTFLAG=false;
                        if(cd>td && cd<nd)
                        NIGHTFLAG=true;

                        /*Update cart session*/
                        let userSession = this._localAuthService.getUserSession();
                        if (!this.isServer) {
                            let formData = {
                                'pk^email': params.email,         //              ('pk^ should be prefixed again primary key, eg here email is primary key)
                                'mobile': params.phone,            //                (mobile is optional, you can pass empty, if not avaiable)
                                'FIRST_NAME': params.firstName,
                                'CUSTOMERTYPE': 'online',
                                'NIGHTFLAG'   : NIGHTFLAG
                            };
                            if (userSession && userSession.authenticated && userSession.authenticated == "true") {

                                /*Start Criteo DataLayer Tags */
                                dataLayer.push({
                                    'event': 'setEmail',
                                    'email': (userSession && userSession.email) ?  userSession.email: ''
                                });
                                /*End Criteo DataLayer Tags */
                                /*window["criteo_q"].push({ event: "setEmail", email: userSession.email});*/
                            }
                        }

                        let cartSession = Object.assign(this._cartService.getCartSession());
                        cartSession['cart']['userId'] = res['userId'];

                        this._cartService.getSessionByUserId(cartSession)
                            .pipe(
                                map((cartSession)=>cartSession),
                                mergeMap((cartSession:any)=>{
                                    //note1: belowline
                                    // Object.assign(this.cartSession, cartSession);
                                    if (this._cartService.buyNow) {
                                        const cartId = cartSession['cart']['cartId'];
                                        cartSession = this._cartService.buyNowSessionDetails;
                                        cartSession['cart']['cartId'] = cartId;
                                        cartSession['itemsList'][0]['cartId'] = cartId;                                         
                                    }
                                    let sro = this._cartService.getShippingObj(cartSession);
                                    return this._cartService.getShippingValue(sro)
                                        .pipe(
                                            map((sv: any) => {
                                                if(sv && sv['status'] && sv['statusCode'] == 200){
                                                    cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                                                    // Below condition is added to resolve : someitmes error is occurring itemsList.length is undefined.
                                                    if(sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null){
                                                        let itemsList = cartSession['itemsList'];
                                                        for(let i=0; i<itemsList.length; i++){
                                                            cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                                                        }
                                                    }
                                                }
                                                return cartSession;
                                            })
                                        );
                                })
                            )
                            .subscribe((res) => {
                                debugger;
                                if (res.statusCode != undefined && res.statusCode == 200) {
                                    let cs = this._cartService.updateCart(res);
                                    this._cartService.setCartSession(cs);
                                    this._cartService.orderSummary.next(res);
                                    this._cartService.cart.next(res.noOfItems);
                                }

                                if (this._cartService.buyNow) {
                                    const sessionDetails = this._cartService.buyNowSessionDetails;
                                    sessionDetails['cart']['userId'] = userSession.userId;
                                    this._cartService.updateCartSessions(null, sessionDetails).subscribe((data) => {
                                        if (this._router.url.includes('/checkout')) {
                                            this._localAuthService.login$.next(this.redirectUrl);
                                            data['userId'] = userSession.userId
                                            this._cartService.setCartSession(data);
                                            this._cartService.orderSummary.next(data);
                                            this._cartService.cart.next(data.noOfItems);
                                            // this._router.navigate(['/checkout'], { queryParams: { index: 2 }, replaceUrl: true });
                                        }
                                        this.slWorking$.emit(false);
                                        this._tms.show({ type: 'success', text: 'Sign in successfully' });
                                    })
                                } else {
                                    if (this._router.url.includes('/checkout')) {
                                        this._localAuthService.login$.next(this.redirectUrl);
                                        // this._router.navigate(['/checkout'], { queryParams: { index: 2 }, replaceUrl: true });
                                    } else {
                                        this._localAuthService.login$.next(this.redirectUrl);
                                        let routeData = this._commonService.getRouteData();
                                        if (routeData['previousUrl'] && routeData['previousUrl'] === '/') {
                                            this._router.navigate(['/']);
                                        } else if (routeData['previousUrl'] && routeData['previousUrl'] !== '' && routeData['previousUrl'] !== '/login') {
                                            this._router.navigateByUrl(routeData['previousUrl']);
                                        } else if (routeData['currentUrl'] && routeData['currentUrl'] !== '' && routeData['currentUrl'] !== '/login') {
                                            this._router.navigateByUrl(routeData['currentUrl']);
                                        } else {
                                            this._router.navigate(['/']);
                                        }                                        
                                    }
                                    this._tms.show({ type: 'success', text: 'Sign in successfully' });
                                }
                            });

                        // if(this._router.url=='/checkout'){
                        //     this._localAuthService.login$.next(this.redirectUrl);
                        // }else{
                        //     let queryParams = this.activatedRoute.snapshot.queryParams;

                        //     this._localAuthService.login$.next(this.redirectUrl);
                        //     let routeData = this._commonService.getRouteData();

                        //     if(routeData['previousUrl'] && routeData['previousUrl'] == "/"){
                        //         this._router.navigate(['/']);
                        //     }
                        //     else if(routeData['previousUrl'] && routeData['previousUrl'] != "" && routeData['previousUrl'] != "/login"){
                        //         this._router.navigateByUrl(routeData['previousUrl']);
                        //     }else if(routeData['currentUrl'] && routeData['currentUrl'] != "" && routeData['currentUrl'] != "/login"){
                        //         this._router.navigateByUrl(routeData['currentUrl']);
                        //     }else{
                        //         this._router.navigate(['/']);
                        //     }
                        // }
                    }
                    /*Data is binding in checkout component but not showing in view so did below*/
                    (<HTMLElement>document.querySelector('.activate-window')).click();
                }, (error) => {
                    console.log('social sign in error', error);
                });
            }
        );
    }

    updateCart(res) {
        this._cartService.updateCartSession(res).subscribe(
            data => {



            }
        );
    }

    logout(){
        this._auth.logout().subscribe(
            (data)=>{
                //this.user=null;
            }
        )
    }

    activateWindow(){
    }

}
