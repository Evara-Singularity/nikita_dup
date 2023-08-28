import { Component, Input, OnInit, ComponentFactoryResolver, Injector, ViewContainerRef, ViewChild, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObserveVisibilityDirectiveModule } from '../../../utils/directives/observe-visibility.directive';
import { PopUpVariant2Module } from '../../pop-up-variant2/pop-up-variant2.module';
import { Subject } from 'rxjs';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { Router } from '@angular/router';

@Component({
    selector: 'images',
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit
{
    show360popupFlag:boolean = false;
    @Input("images") images: any[] = null;
    @Input() showPocMsn: boolean = false;
    @Input() pageLinkName = '';
    currentImageIndex = -1;
   

    constructor(
        private _componentFactoryResolver:ComponentFactoryResolver,
        private injector:Injector,
        private _commonService:CommonService,
        private _analyticsService:GlobalAnalyticsService,
        private router:Router
    ) {
     }

    ngOnInit(): void
    {
        if (this.images.length) { this.currentImageIndex = 0; }
    }

    updateImageIndex(index) { this.currentImageIndex = index; }

    
    open36popup(){
     this._commonService.open360popup1$.next(true);
     this.setAdobeDataTracking();
    }
    setAdobeDataTracking(){
          this._analyticsService.sendAdobeCall(
            {page:{
              channel: 'pdp', 
              linkPageName: this.pageLinkName,
              linkName:  this.showPocMsn ? '3D Image click' : '360 image click'
            }}, 
            "genericClick")
        
      }
}

    

