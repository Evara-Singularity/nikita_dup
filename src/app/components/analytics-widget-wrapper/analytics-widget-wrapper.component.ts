import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef, Inject,
  Injector, } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import CONSTANTS from '../../config/constants';

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
  @Input() graphData = null;
  @Input() categoryName;
  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

  ngOnInit(): void {
     console.log("categoryId",this.categoryId);
     this.getData();
  }
  
  getData(){
      if(this.graphData && this.graphData.length > 0){
        console.log("this.graphData",this.graphData);
      this.graphData.forEach(element => {
       if (element && element.block_name == 'attribute_report'){
            this.attributeDataWithoutProcessing = element.data;
        }
        else if (element && element.block_name == 'product_report') {
            this.priceDataWithoutProcessing = element.data;
            console.log(" this.priceDataWithoutProcessing", this.priceDataWithoutProcessing);
        }
        else {
          this.brandDataWithoutProcessing = element.data;
         }
        });
      }
  }
  getMaxValue(element,percent?){
    let maxValue = 0,maxValueAttributeName;
    let attrName = element; 
    for(var attr in attrName){
        if(attrName[attr] > maxValue){
            maxValue = attrName[attr];
            maxValueAttributeName = attr;
        }
    }
    if(percent=='percent'){
      return maxValueAttributeName;
    }
    else{
      return maxValue;
    }
  }
 async loadPriceWidget(){
    const {AnalyticsGraphWidgetComponent} = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.priceContainerInstance = this.priceContainerRef.createComponent(
      factory,
      null,
      this.injector
     )
     console.log("this.priceContainerInstance",this.priceContainerInstance);
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
  generateFragmentUrl(filterName, filterValue){
    console.log("filterName",filterName,"filterValue",filterValue)
    if(filterValue && filterValue.toString().toLowerCase() === 'others'){
      return;
    }
    let fragmentPriceObject = {};
    if (filterName == 'price') {
      fragmentPriceObject['price'] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject;
      this.commonService.applyFilter();
    }
    else if (filterName == 'brand') {
      let fragmentBrandObject = {
        'brand': [filterValue.toString()]
      }
      fragmentPriceObject['brand'] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject;
      this.commonService.applyFilter();
    }
    else {
      fragmentPriceObject[filterName] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject;
      this.commonService.applyFilter();
    }
  }
  formatPrice(value:string,addSymbol?:boolean) {
    const RUPEE = "₹";
    let formatValue = value.split(',');
    if(formatValue[1]){
        return (addSymbol ? (RUPEE + formatValue[0] + '-' + RUPEE+formatValue[1]) : (formatValue[0] + '-' +formatValue[1]));
    }
     else{
      return (value.match("^[a-zA-Z]*$") ? formatValue[0] : (RUPEE + formatValue[0]));
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

