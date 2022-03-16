import { Router, RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { KpToggleDirectiveModule } from "@app/utils/directives/kp-toggle.directive";
import { CommonService } from "@app/utils/services/common.service";
import { SeoTablesModule } from '@app/modules/seo-tables/seo-tables.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';

@Component({
    selector: 'category-footer',
    templateUrl: './category-footer.component.html',
    styleUrls:  ['./category-footer.scss']
})
export class CategoryFooterComponent{
    @Input('categoryFooterData') categoryFooterData;
    todayDate;
    constructor(public _commonService: CommonService, private _router: Router){
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
        this._router.navigate(['/' + (url).trim()]);
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
        KpToggleDirectiveModule,
        SeoTablesModule,
        ReplacePipeModule
    ],
    exports: [
        CategoryFooterComponent
    ]
})
export class CategoryFooterModule { }