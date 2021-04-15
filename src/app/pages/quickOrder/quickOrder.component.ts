
import { LocalStorageService } from 'ngx-webstorage';
import { Component, ViewEncapsulation, Input, PLATFORM_ID, Inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { QuickOrderService } from './quickOrder.service';
import { Title } from '@angular/platform-browser';
import {Subject} from 'rxjs/Subject';
import { mergeMap} from 'rxjs/operators/mergeMap';
import { map } from 'rxjs/operators/map';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs/observable/of';
import { takeUntil } from 'rxjs/operators';
import CONSTANTS from '../..//config/constants';
import { GlobalState } from '../..//utils/global.state';
import { LocalAuthService } from '../..//utils/services/auth.service';
import { FooterService } from '../..//utils/services/footer.service';
import { CartService } from '../..//utils/services/cart.service';
import { CommonService } from '../..//utils/services/common.service';

@Component({
    selector: 'quick-order',
    templateUrl: './quickOrder.html',
    styleUrls: ['./quickOrder.scss'],
    encapsulation: ViewEncapsulation.None
})

export class QuickOrderComponent {
    @Input() showHeading: boolean = false;
    cartSessionUpdated$: Subject<any> = new Subject<any>();
    sessionCart: {};
    itemsList: Array<{}>;
    cart: {};
    isServer: boolean;
    isBrowser: boolean;
    public isShowLoader: boolean = false;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    signInText;
    private cDistryoyed = new Subject();
    itemsValidationMessage: Array<{}>;
   // @ViewChild('quantityTarget') quantityTarget: HTMLInputElement;
    //recentProductList: Array<any>;

    constructor(
        private _gState: GlobalState,
        private meta: Meta,
        private _activatedRoute: ActivatedRoute,
        @Inject(PLATFORM_ID) platformId,
        private _localAuthService: LocalAuthService,
        private title: Title,
        private localStorageService: LocalStorageService,
        public footerService: FooterService,
        public cartService: CartService,
        private _quickOrderService: QuickOrderService,
        private _commonService: CommonService,
        public router: Router) {

        this.itemsList = [];
        this.itemsValidationMessage = [];
        this.cart = {};
        this.title.setTitle('Quick order-Moglix.com');
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        const user = this.localStorageService.retrieve('user');
        this._localAuthService.login$.pipe(
            takeUntil(this.cDistryoyed)).subscribe(
                (data) => {
                    const user = this.localStorageService.retrieve('user');
                    if (user && user.authenticated == "true") {
                        this.signInText = "Proceed to Checkout";
                        console.log("login successful");
                    }
                }
            );
        this._localAuthService.logout$.pipe(
            takeUntil(this.cDistryoyed)
        ).subscribe(
            (data) => {
                const user = this.localStorageService.retrieve('user');
                if (user && user.authenticated == "true") {
                    this.signInText = "Sign In to Checkout";
                    console.log("logOut successful");
                }
            }
        );
        if (user && user.authenticated == "true") {
            this.signInText = "Proceed to Checkout";
        }
        else {
            this.signInText = "Sign in to checkout";
        }

    }

    getRecentProduct() {
        // if (this.localStorageService.retrieve('recentproduct')) {
        //     this.recentProductList = this.localStorageService.retrieve('recentproduct');
        // }
    }


    ngOnInit() {
       
        
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        //this.getRecentProduct();
        this.footerService.setFooterObj({footerData: false});
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());

        this.cartService.orderSummary.subscribe(
            data => {
                this.itemsList = data.itemsList;
            }
        );

        this._activatedRoute.data
        .pipe(
            map(data => data.qores),
            mergeMap((cartSession: any) => {
                debugger;
                if (this.isServer) {
                    return of(null);
                }
                /**
                 * return cartsession, if session id missmatch
                 */
                if (cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 202) {
                    return of(cartSession);
                }
                return this.getShippingValue(cartSession);
            })
        ).subscribe((cartSession) => {
            this.isShowLoader = true;
            if (cartSession && cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 200) {
                cartSession = this.cartService.updateCart(cartSession);
                this.cartService.setCartSession(cartSession);
                this.cart = cartSession['cart'];
                if (cartSession['itemsList'] == null) {
                    this.itemsList = [];
                } else {
                    this.itemsList = cartSession['itemsList'];
                }
                setTimeout(()=>{
                    this.cartSessionUpdated$.next(cartSession);
                    this.cartService.orderSummary.next(cartSession);
                    this.cartService.cart.next(cartSession['cart'] !== undefined ? cartSession['noOfItems'] : 0);
                }, 0)                
            } else if (cartSession && cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 202) {
                const cs = this.cartService.updateCart(cartSession['cart']);
                this.cartService.setCartSession(cs);
                this.cart = cs;
                if (cs['itemsList'] == null) {
                    this.itemsList = [];
                } else {
                    this.itemsList = cs['itemsList'];
                }
                setTimeout(()=>{
                    this.cartSessionUpdated$.next(cs);
                    this.cartService.orderSummary.next(cs);
                    this.cartService.cart.next(cs['cart'] !== undefined ? cs['noOfItems'] : 0);
                },0)                
                this._localAuthService.setUserSession(cartSession['userData']);
                this._localAuthService.logout$.emit();
            }
        });

        this.sessionCart = this._localAuthService.getUserSession();

        this._commonService.setWindowLoaded();
    }


    ngAfterViewInit() {

    }
    ngOnDestroy() {
        /*this.footerService.setFooterObj({footerData: false});                            
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());*/
    }

    itemsValidationMessageUpdated(itemsValidationMessage) {
        console.log(itemsValidationMessage);
        itemsValidationMessage = this._commonService.itemsValidationMessage;
        this.itemsValidationMessage = itemsValidationMessage;
    }

    getShippingValue(cartSession){
        let sro = this.cartService.getShippingObj(cartSession);
        return this.cartService.getShippingValue(sro)
                    .pipe(
                        map((sv: any) => {
                            if(sv && sv['status'] && sv['statusCode'] == 200){
                                cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
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
    }
    deleteProduct(index) {
        this.itemsList.splice(index, 1);
        this.cart = this._quickOrderService.updateCart(this.itemsList, this.cart);
        this.updateCartSession();

    }

    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }

    decrementQuantity(event, i) {
        this.updateQuantity(event - 1, i);
    }

    incrementQuantity(event, i) {
        this.updateQuantity(Number(event) + 1, i);

    }


    updateQuantity(event, i) {

        let updatedQuantity = event;
        let productBO = {};
        let item = this.itemsList[i];
        this._quickOrderService.getProduct(item).subscribe((response) => {
            productBO = response;
            let productPriceQuantity = productBO['productBO']['productPartDetails'][item['productId'].toUpperCase()]['productPriceQuantity']['india'];
            if (updatedQuantity > productPriceQuantity.quantityAvailable) {
                alert('Quantity not available');
                let id = '#quantityInput' + i;
                if(!this.isServer){
                    (<HTMLInputElement>document.querySelector(id)).value = this.itemsList[i]['productQuantity'];
                }
                this.itemsList[i]['productQuantity'] = item['productQuantity'];
            }
            else if (updatedQuantity < productPriceQuantity.moq) {
                alert('Minimum quantity is ' + productPriceQuantity.moq);
                let id = '#quantityInput' + i;
                if(!this.isServer){
                    (<HTMLInputElement>document.querySelector(id)).value = this.itemsList[i]['productQuantity'];
                }

            }
            else {
                let remainder = (productPriceQuantity.quantityAvailable - updatedQuantity) % productPriceQuantity.moq;
                if (remainder > 0) {
                    alert('Incremental Count not matched')
                } else {
                    this.itemsList[i]['productQuantity'] = updatedQuantity;
                    this.itemsList[i]['productUnitPrice'] = item['productUnitPrice'];
                    this.itemsList[i]['totalPayableAmount'] = item['productUnitPrice'] * updatedQuantity;

                    this.cart = this._quickOrderService.updateCart(this.itemsList, this.cart);

                    this.updateCartSession();


                }
            }
        });
    }

    updateCartSession() {
        this.sessionCart['itemsList'] = this.itemsList;
        this.sessionCart['cart'] = this.cart;

        this._quickOrderService.updateCartSession(this.sessionCart).subscribe(res => {
 
            if (res['statusCode'] == 200) {
                alert('Cart quantity updated successfully');
                this.cartService.cart.next(res['noOfItems']);
            }
        });
    }
    placeOrder(){
          const user = this.localStorageService.retrieve('user');
          if (user && user.authenticated == "true"){
              console.log(this._gState);
             this.router.navigateByUrl('/checkout');
          }
          else {
              this._gState.notifyDataChanged('loginPopup.open',{redirectUrl:'/checkout', template: 2});
          }
     }
    }




