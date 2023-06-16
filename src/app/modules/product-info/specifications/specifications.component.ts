import { Component, Input, OnInit, Output,EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { fade } from '@utils/animations/animation';
import { BrandLinkMapping } from '@app/utils/brandLinkMapping';


@Component({
    selector: 'specifications',
    templateUrl: './specifications.component.html',
    styleUrls: ['./specifications.component.scss'],
    animations: [
        fade
    ]
})
export class SpecificationsComponent implements OnInit
{
    productStaticData = this._commonService.defaultLocaleValue;
    @Output() callback: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input("specifications") specifications = null;
    @Output() openLoginPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();
    public isAllListShow:boolean;
    enableSecondaryAttributes: boolean = false;
    showSecondaryAttributes: boolean = false;
    user: any;
    showNavToStorePage:boolean=false;
    
    constructor(public _commonService: CommonService,private _localAuthService : LocalAuthService,private cdr : ChangeDetectorRef) { }

    ngOnInit() {
        console.log('specifications', this.specifications);
        this.checkSecondaryAttributes();
        if (BrandLinkMapping.hasOwnProperty(this.specifications["brand"]["brandId"])) {
            this.showNavToStorePage=true;
            this.specifications["brand"]['storeLink']=BrandLinkMapping[this.specifications["brand"]["brandId"]];
          }
        this.getStaticSubjectData();  
    }
    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
      }

    checkSecondaryAttributes() {
        if (this.specifications['secondaryAttributes']) {
            const secondaryAttributes = Object.assign({}, this.specifications['secondaryAttributes']);
            for (const key in secondaryAttributes) {
                if (Object.prototype.hasOwnProperty.call(secondaryAttributes, key)) {
                    const element = secondaryAttributes[key];
                    this.enableSecondaryAttributes = this.enableSecondaryAttributes || (element && element.length > 0)
                }
            }
        }
    }
    showMore() {
         this.user = this._localAuthService.getUserSession();
        if (this.user && this.user['authenticated'] == 'true') {
            this.toggleShowMore();
        }
        else {
            this.openLoginPopUp.emit()
            this._localAuthService.login$.subscribe((data) => {
                this.toggleShowMore();
                this.cdr.detectChanges();
            })
        }
    }

    toggleShowMore(){
        this.showSecondaryAttributes = !this.showSecondaryAttributes;
        this.callback.emit(this.showSecondaryAttributes);
    }
}
