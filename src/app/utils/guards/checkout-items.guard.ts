import { CartService } from '@app/utils/services/cart.service';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { CommonService } from '../services/common.service';

@Injectable()
export class IsCartWithItemsGuard implements CanActivate
{
    constructor(private _cartService: CartService, private router: Router, public _commonService: CommonService)
    {
        
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree>
    {
        const noOfItems:number = this._cartService.getCartItemsCount();
        if (noOfItems === 0) { this.router.navigateByUrl('quickorder'); return false}
        return true;
    }
}