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
  @Input() graphData;
  @Input() categoryName;

  ngOnInit(): void {
     console.log("categoryId",this.categoryId);
  }
 async loadPriceWidget(){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.priceContainerInstance = this.priceContainerRef.createComponent(
      factory,
      null,
      this.injector
     )
     this.priceContainerInstance.instance['chartType'] = 'price';
     this.priceContainerInstance.instance['categoryId'] = this.categoryId;
     this.priceContainerInstance.instance['graphData'] = this.graphData;
     this.priceContainerInstance.instance['categoryName'] = this.categoryName;
  }
  async loadBrandWidget(){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.brandContainerInstance = this.brandContainerRef.createComponent(
      factory,
      null,
      this.injector
     )
     this.brandContainerInstance.instance['chartType'] = 'brand';
     this.brandContainerInstance.instance['categoryId'] = this.categoryId;
     this.brandContainerInstance.instance['graphData'] = this.graphData;
     this.brandContainerInstance.instance['categoryName'] = this.categoryName;
  }
  async loadAttributeWidget(){
    debugger; 
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.attributeContainerInstance = this.attributeContainerRef.createComponent(
      factory,
      null,
      this.injector
     )
     this.attributeContainerInstance.instance['chartType'] = 'attribute';
     this.attributeContainerInstance.instance['categoryId'] = this.categoryId;
     this.attributeContainerInstance.instance['graphData'] = this.graphData;
     this.attributeContainerInstance.instance['categoryName'] = this.categoryName;
  }
  resetLazyComponents(){
    if (this.priceContainerInstance) {
      this.priceContainerInstance = null;
      this.priceContainerRef.remove();
    }
    if (this.brandContainerInstance) {
      this.brandContainerInstance = null;
      this.brandContainerRef.remove();
    }
    if (this.attributeContainerInstance) {
      this.attributeContainerInstance = null;
      this.attributeContainerRef.remove();
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

