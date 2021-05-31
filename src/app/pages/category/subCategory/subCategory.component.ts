import {
    Component, ViewEncapsulation, Input, EventEmitter, Output,
    ChangeDetectorRef, ChangeDetectionStrategy, PLATFORM_ID, Inject, NgModule
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../utils/services/category.service';
import { SubCategoryService } from "../../../utils/services/subCategory.service";
import { CONSTANTS } from "@config/constants";
import {Subject} from "rxjs";
import { fade } from '@utils/animations/animation'
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { CommonService } from '@services/common.service';
import { CommonModule } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ClientUtility } from '@app/utils/client.utility';
@Component({
    selector: 'sub-category',
    templateUrl: 'subCategory.html',
    styleUrls: [
        './subCategory.scss'
    ],
    providers:[],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        fade
    ]
})

export class SubCategoryComponent {
    relatedCatgoryList: Array<any> = [];
    @Output() getCategoryById:EventEmitter<any>=new EventEmitter<any>();
    @Output() updateSubCategoryCount$: EventEmitter<any> = new EventEmitter<any>();
    catdata;
    imageBasePath: string;
    public isAllListShow:boolean;
    moreLessCategoryText:string="SHOW MORE";
    @Input() relatedCatgoryListUpdated: Subject<any>;
    defaultImage;

    constructor(private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, public categoryService: CategoryService, private _subCategoryService: SubCategoryService, public router: Router, public commonService: CommonService) {
    };

    ngOnInit() {
        this.imageBasePath = CONSTANTS.IMAGE_BASE_URL;

        this.relatedCatgoryListUpdated.subscribe((relatedCatgoryList)=>{
            this.showList(false);
            this.relatedCatgoryList = relatedCatgoryList["children"];
            this.cd.markForCheck(); // marks path
        })
    }

    goToAnother(id,categoryLink) {
        let obj = { "id": id };
        this.getCategoryById.emit(obj);
        this.router.navigateByUrl(categoryLink);
    }

    showList(flag?) {
        ClientUtility.scrollToTop(2000);
        this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
        if(this.isAllListShow)
        {
            this.moreLessCategoryText="SHOW lESS";
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