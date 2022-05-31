import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CategoryData } from "@app/utils/models/categoryData";
import { CommonService } from "@app/utils/services/common.service";

@Component({
    selector: 'trending-categories',
    templateUrl: './trending-categories.component.html',
    styleUrls: ['./trending-categories.component.scss']
})
export class TrendingCategoriesComponent {
    @Input('flyOutData') flyOutData: CategoryData[];
    @Input('tocd') tocd;
    
    constructor(private _commonService: CommonService) {}

    setCookieLink(catName,categoryCodeorBannerName, type){
        this._commonService.setSectionClickInformation('homepage', type);
        this._commonService.resetSelectedFilterData();
        var date = new Date();
        date.setTime(date.getTime()+(30*24*60*60*1000));
        document.cookie = "adobeClick=" + catName+"_"+categoryCodeorBannerName+"; expires=" + date.toUTCString() + ";path=/";
    }
}

@NgModule({
    declarations: [TrendingCategoriesComponent],
    imports: [CommonModule, RouterModule],
    exports: [TrendingCategoriesComponent]
})
export class TrendingCategoriesModule { }