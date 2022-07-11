import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
    selector: 'cart-no-item',
    templateUrl: './cart-no-item.component.html',
    styleUrls: ['./cart-no-item.component.scss'],
})

export class CartNoItemComponent implements OnInit, OnDestroy
{

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    flyOutData: CategoryData[] = [];
    flyOutDataSubscription: Subscription = null;

    constructor(public cartService: CartService, private _dataService: DataService, private _localAuthService:LocalAuthService,private _router:Router) { }


    ngOnInit(): void
    {
        const FLYOUT_URL = environment.BASE_URL + ENDPOINTS.GET_FDK_HOME;
        this.flyOutDataSubscription = this._dataService.callRestful("GET", FLYOUT_URL).pipe(map((response: CategoryData[]) =>
        {
            if (response && response['data']) { return response['data']; }
            return [];
        })).subscribe((data) => this.flyOutData = data);
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
        this.flyOutDataSubscription.unsubscribe()
    }
}