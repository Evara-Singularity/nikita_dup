import {
    Component, ViewEncapsulation, Input, EventEmitter, Output, PLATFORM_ID, Inject, NgModule, OnInit
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '@utils/services/category.service';
import { fade } from '@utils/animations/animation'
import { CommonService } from '@services/common.service';
import { CommonModule } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { environment } from 'environments/environment';

@Component({
    selector: 'sub-category',
    templateUrl: 'subCategory.html',
    styleUrls: [
        './subCategory.scss'
    ],
    providers:[],
    encapsulation: ViewEncapsulation.None,
    animations: [
        fade
    ]
})

export class SubCategoryComponent implements OnInit{
    @Input() relatedCatgoryList: Array<any> = [];
    @Output() getCategoryById:EventEmitter<any>=new EventEmitter<any>();
    @Output() updateSubCategoryCount$: EventEmitter<any> = new EventEmitter<any>();
    catdata;
    imageBasePath: string = environment.IMAGE_BASE_URL;
    public isAllListShow:boolean;
    moreLessCategoryText:string="SHOW MORE";
    defaultImage = environment.IMAGE_BASE_URL+'assets/img/home_card.webp';

    constructor(@Inject(PLATFORM_ID) platformId, public categoryService: CategoryService, public router: Router, public commonService: CommonService) {
    };

    ngOnInit(): void {
        this.initializeSubcategoryData(this.relatedCatgoryList);
        this.showList(false);
    }

    initializeSubcategoryData(data) {
        this.relatedCatgoryList = data;
    }

    goToAnother(id,categoryLink) {
        let obj = { "id": id };
        this.getCategoryById.emit(obj);
        this.router.navigateByUrl(categoryLink);
    }

    showList(flag?) {
        // ClientUtility.scrollToTop(2000);
        this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
        if(this.isAllListShow)
        {
            this.moreLessCategoryText="SHOW LESS";
        }
        else{
            this.moreLessCategoryText="SHOW MORE";
        }
    }
}


@NgModule({
    declarations: [SubCategoryComponent],
    imports: [
        CommonModule,
        LazyLoadImageModule,
        RouterModule,
    ],
    exports: [
        SubCategoryComponent
    ]
})
export class SubCategoryModule {}
export class CategoryModule extends SubCategoryModule {}
export class BrandModule extends SubCategoryModule {}
export class BrandV1Module extends SubCategoryModule {}
export class SearchModule extends SubCategoryModule {}