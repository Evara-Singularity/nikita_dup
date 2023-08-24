import {
  Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef, Inject,
  Injector,
} from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import CONSTANTS from '../../config/constants';
import { GlobalAnalyticsService } from '../../utils/services/global-analytics.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'analytics-widget-wrapper',
  templateUrl: './analytics-widget-wrapper.component.html',
  styleUrls: ['./analytics-widget-wrapper.component.scss']
})
export class AnalyticsWidgetWrapperComponent implements OnInit {
  isServer: boolean;
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
  @Input() isL2CategoryCheck;
  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
  productStaticData = this.commonService.defaultLocaleValue;
  changeStaticSubscription: Subscription;


  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    public commonService: CommonService,
    private router : Router, 
    private _globalAnalyticsService: GlobalAnalyticsService) {
  }

  ngOnInit(): void {
    this.getData();
    this.getLocalization();
  }

  getLocalization() {
    this.changeStaticSubscription = this.commonService.changeStaticJson.asObservable().subscribe(localization_content => {
      this.productStaticData = localization_content;
    });
  }

  getData() {
    if (this.graphData && this.graphData.length > 0) {
      // console.log("this.graphData",this.graphData);
      this.graphData.forEach(element => {
        if (element && element.block_name == 'attribute_report') {
          this.attributeDataWithoutProcessing = element.data;
        }
        else if (element && element.block_name == 'product_report') {
          this.priceDataWithoutProcessing = element.data;
          // console.log(" this.priceDataWithoutProcessing", this.priceDataWithoutProcessing);
        }
        else {
          this.brandDataWithoutProcessing = element.data;
        }
      });
    }
  }
  getMaxValue(element, percent?) {
    let maxValue = 0, maxValueAttributeName;
    let attrName = element;
    for (var attr in attrName) {
      if (attrName[attr] > maxValue) {
        maxValue = attrName[attr];
        maxValueAttributeName = attr;
      }
    }
    if (percent == 'percent') {
      return maxValueAttributeName;
    }
    else {
      return maxValue;
    }
  }
  async loadPriceWidget() {
    const { AnalyticsGraphWidgetComponent } = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
    const factory = this._componentFactoryResolver.resolveComponentFactory(AnalyticsGraphWidgetComponent)
    this.priceContainerInstance = this.priceContainerRef.createComponent(
      factory,
      null,
      this.injector
    )
    // console.log("this.priceContainerInstance",this.priceContainerInstance);
    this.priceContainerInstance.instance['chartType'] = 'price';
    this.priceContainerInstance.instance['categoryId'] = this.categoryId;
    this.priceContainerInstance.instance['graphData'] = this.graphData;
    this.priceContainerInstance.instance['categoryName'] = this.categoryName;
    this.priceContainerInstance.instance['isL2CategoryCheck'] = this.isL2CategoryCheck;
  }
  async loadBrandWidget() {
    const { AnalyticsGraphWidgetComponent } = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
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
    this.brandContainerInstance.instance['isL2CategoryCheck'] = this.isL2CategoryCheck;
  }
  async loadAttributeWidget() {
    const { AnalyticsGraphWidgetComponent } = await import('../../components/analytics-graph-widget/analytics-graph-widget.component');
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
  resetLazyComponents() {
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
  generateFragmentUrl(filterName, filterValue) {
    this.sendAnalyticsFilterTracking;
    if (filterValue && filterValue.toString().toLowerCase() === 'others') {
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
  sendAnalyticsFilterTracking() {
    let page = {
      channel: "category",
      pageName: "moglix:category page",
      linkName: "post analytics click",
      loginStatus: "guest",
    };
    // let custData = {};
    const custData = this.commonService.custDataTracking;
    let order = {}
    this._globalAnalyticsService.sendAdobeCall({ page, custData, order }, "genericClick");
  }
  formatPrice(value: string, addSymbol?: boolean) {
    const RUPEE = "₹";
    let formatValue = value.split(',');
    if (formatValue[1]) {
      return (addSymbol ? (RUPEE + formatValue[0] + '-' + RUPEE + formatValue[1]) : (formatValue[0] + '-' + formatValue[1]));
    }
    else {
      return (value.match("^[a-zA-Z]*$") ? formatValue[0] : (RUPEE + formatValue[0]));
    }
  }

  ngAfterViewInit() {
    if (this.commonService.isBrowser) {
      this.resetLazyComponents()
    }
  }
  ngOnDestroy() {
    // console.log("destroyed");
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
    this.resetLazyComponents();
  }
  callPriceFunction(priceObj){
    if(this.isL2CategoryCheck){
      this.router.navigate(['/'+ priceObj.categoryLink])
    }
    else{
      this.generateFragmentUrl('price',this.formatPrice(priceObj.interval,false))
    }
  }
  callBrandUrl(brandObj){
    if(this.isL2CategoryCheck === true){
      if(brandObj.link == null){
        return;
      }
      else{
        this.router.navigate(['/'+ brandObj.link])
      }
    }
    else{
      if(brandObj.brandCategoryLink == null){
       return;
      }
      else{
        this.router.navigate(['/'+ brandObj.brandCategoryLink]);
      }
    }
  }
}

