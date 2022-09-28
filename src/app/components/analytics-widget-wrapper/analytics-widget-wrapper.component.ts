import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef, Inject,
  Injector, } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'analytics-widget-wrapper',
  templateUrl: './analytics-widget-wrapper.component.html',
  styleUrls: ['./analytics-widget-wrapper.component.scss']
})
export class AnalyticsWidgetWrapperComponent implements OnInit {

  constructor(private _componentFactoryResolver:ComponentFactoryResolver,private _viewContainerReference:ViewContainerRef, private injector: Injector,private commonService:CommonService) { }
  priceContainerInstance = null;
  attributeContainerInstance = null;
  brandContainerInstance = null;
  @ViewChild("priceContainerRef", { read: ViewContainerRef })
  priceContainerRef: ViewContainerRef;
  @ViewChild("attributeContainerRef", { read: ViewContainerRef })
  attributeContainerRef: ViewContainerRef;
  @ViewChild("brandContainerRef", { read: ViewContainerRef })
  brandContainerRef: ViewContainerRef;
  @Input() chartContainer;
  @Input() categoryId;
  ngOnInit(): void {
     console.log("categoryId");
  }
 async loadPriceWidget(event){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.priceContainerInstance = this._viewContainerReference.createComponent(
      factory,
      null,
      this.injector
     )
     this.priceContainerInstance.instance['chartType'] = 'price';
  }
  async loadBrandWidget(){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.brandContainerInstance = this._viewContainerReference.createComponent(
      factory,
      null,
      this.injector
     )
     this.brandContainerInstance.instance['chartType'] = 'brand';
  }
  async loadAttributeWidget(){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.attributeContainerInstance = this._viewContainerReference.createComponent(
      factory,
      null,
      this.injector
     )
     this.attributeContainerInstance.instance['chartType'] = 'attribute';
  }
  resetLazyComponents(){
    if (this.priceContainerInstance) {
      this.priceContainerInstance = null;
      this.priceContainerInstance.remove();
    }
    if (this.brandContainerInstance) {
      this.brandContainerInstance = null;
      this.brandContainerInstance.remove();
    }
    if (this.attributeContainerInstance) {
      this.attributeContainerInstance = null;
      this.attributeContainerInstance.remove();
    }
  }
  ngAfterViewInit()
  {
      if (this.commonService.isBrowser) {
        this.resetLazyComponents()
      }
  }   
  ngOnDestroy(){
    console.log("destroyed");
    this.resetLazyComponents();
  }
}

