import { Router, RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { KpToggleDirectiveModule } from "@app/utils/directives/kp-toggle.directive";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { CommonService } from "@app/utils/services/common.service";


@Component({
    selector: 'category-footer',
    templateUrl: './category-footer.component.html',
    styleUrls:  ['./category-footer.scss']
})
export class CategoryFooterComponent{
    @Input('categoryFooterData') categoryFooterData;
    todayDate;
    constructor(public _commonService: CommonService, private _router: Router){
        this.todayDate = Date.now();
    }

    ngOnInit(){
        console.log(this.categoryFooterData);
    }

    getTopTenBrandName(buckets: Array<{}>) {
        let bNames = null;

        if (buckets === undefined || buckets === null || (buckets && buckets.length === 0)) {
            return '';
        }
        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i]['name'] === 'brand') {
                for (let j = 0; j < buckets[i]['terms'].length; j++) {
                    if (bNames === null) {
                        bNames = buckets[i]['terms'][j]['term'];
                    } else {
                        bNames = bNames + ', ' + buckets[i]['terms'][j]['term'];
                    }
                    if (j === 9) {
                        break;
                    }
                }
                break;
            }
        }
        return bNames;
    }
    navigateTo(url) {
        this._router.navigate(['\\' + url]);
    }

    getFeaturedProducts(products: Array<{}>) {
        let fProducts = null;
        if (products == undefined || products == null || (products && products.length == 0))
            return "";

        for (let i = 0; i < products.length; i++) {
            if (fProducts == null)
                fProducts = products[i]['productName'];
            else
                fProducts = fProducts + ", " + products[i]['productName'];
            if (i == 5)
                break;
        }
        return fProducts;
    }
}


@NgModule({
    declarations: [
        CategoryFooterComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MathFloorPipeModule,
        KpToggleDirectiveModule,
    ],
    exports: [
        CategoryFooterComponent
    ]
})
export class CategoryFooterModule { }
// export class CategoryModule extends CategoryFooterModule { }