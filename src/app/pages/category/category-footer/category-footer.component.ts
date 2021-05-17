import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { KpToggleDirectiveModule } from "@app/utils/directives/kp-toggle.directive";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { CommonService } from "@app/utils/services/common.service";


@Component({
    selector: 'category-footer',
    templateUrl: './category-footer.component.html'
})
export class CategoryFooterComponent{
    @Input('categoryFooterData') categoryFooterData;
    constructor(public _commonService: CommonService){}

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
}


@NgModule({
    declarations: [
        CategoryFooterComponent
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        KpToggleDirectiveModule,
    ]
})
export class CategoryFooterModule { }
export class CategoryModule extends CategoryFooterModule { }