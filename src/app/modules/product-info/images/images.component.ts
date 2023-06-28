import { Component, Input, OnInit, ComponentFactoryResolver, Injector, ViewContainerRef, ViewChild, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObserveVisibilityDirectiveModule } from '../../../utils/directives/observe-visibility.directive';
import { PopUpVariant2Module } from '../../pop-up-variant2/pop-up-variant2.module';

@Component({
    selector: 'images',
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit
{
    product3dInstance = null;
    @ViewChild("product3dContainerRef", { read: ViewContainerRef })
    product3dContainerRef: ViewContainerRef;
    show360popupFlag:boolean = false;
    @Input("images") images: any[] = null;
    currentImageIndex = -1;

    constructor(
        private _componentFactoryResolver:ComponentFactoryResolver,
        private injector:Injector
    ) {
     }

    ngOnInit(): void
    {
        if (this.images.length) { this.currentImageIndex = 0; }
    }

    updateImageIndex(index) { this.currentImageIndex = index; }

    async load360ViewComponent(){
        this.show360popupFlag = true;
            const { ProductThreeSixtyViewComponent } = await import('../../../components/product-three-sixty-view/product-three-sixty-view.component');
            const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponent);
            this.product3dInstance = this.product3dContainerRef.createComponent(
            factory, 
            null, 
            this.injector
        );
    } 
    outData(e){

    }
}

    

