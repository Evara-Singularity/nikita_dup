import { Router } from '@angular/router';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { CategoryData } from '@app/utils/models/categoryData';
import { CONSTANTS } from '@config/constants';
import { CartService } from '@services/cart.service';
import { DataService } from '@utils/services/data.service';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalAuthService } from './../../../utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'cart-no-item',
    templateUrl: './cart-no-item.component.html',
    styleUrls: ['./cart-no-item.component.scss'],
})

export class CartNoItemComponent implements OnInit, AfterViewInit, OnDestroy
{

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    flyOutData: CategoryData[] = [];
    flyOutDataSubscription: Subscription = null;

    constructor(public cartService: CartService, private _dataService: DataService, private _localAuthService:LocalAuthService,private _router:Router,private _commonService:CommonService) { }


    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        if (this.cartService.getGenericCartSession?.itemsList?.length == 0) {
            const FLYOUT_URL = environment.BASE_URL + ENDPOINTS.GET_FDK_HOME;
            this.flyOutDataSubscription = this._dataService.callRestful("GET", FLYOUT_URL).pipe(map((response: CategoryData[]) => {
                if (response && response['data']) { return response['data']; }
                return [];
            })).subscribe((data) => this.flyOutData = data);
        }
        this.addLottieScript();
        this._commonService.callLottieScript();
    }
    
    addLottieScript() {
        this._commonService.addLottieScriptSubject.subscribe(lottieInstance => {
        this._commonService.callLottieScript();
        lottieInstance.next();
        
     });
        
    }

    navigateToLogin()
    {
        const queryParams = { backurl: '/quickorder', title:'Continue to access your cart'};
        this._localAuthService.setBackURLTitle(queryParams.backurl, queryParams.title);
        let navigationExtras: NavigationExtras = { queryParams: queryParams };
        this._router.navigate(["/login"], navigationExtras);
    }

    get isLoggedIn() { return this._localAuthService.isUserLoggedIn()}

    ngOnDestroy(): void
    {
        if(this.flyOutDataSubscription){
            this.flyOutDataSubscription.unsubscribe()
        }
    }

    continueToShopping(){
      this._router.navigate(['/']).catch(err=>{
        console.log("router error =====>" , err);
        //this._router.navigate(['/']);
        window.location.href = "/";
      });
    }
}