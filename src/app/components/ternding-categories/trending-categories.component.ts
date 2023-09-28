import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CategoryData } from "@app/utils/models/categoryData";
import { CommonService } from "@app/utils/services/common.service";

@Component({
    selector: 'trending-categories',
    templateUrl: './trending-categories.component.html',
    styleUrls: ['./trending-categories.component.scss']
})
export class TrendingCategoriesComponent {
    @Input('flyOutData') flyOutData: CategoryData[];
    @Input('tocd') tocd = "Trending Categories";
    
    constructor(private _commonService: CommonService, private router: Router) {}

    setCookieLink(catName,categoryCodeorBannerName, type, url){
        const isAbsoluteUrl = this._commonService.isAbsoluteUrl(url);
        isAbsoluteUrl ? window.open(url, '_blank') : this.router.navigateByUrl('/'+url);
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