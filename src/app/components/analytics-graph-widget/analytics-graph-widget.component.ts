import { PercentPipe, isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';
import Chart from 'highcharts/es-modules/Core/Chart/Chart.js';
import ColumnSeries from 'highcharts/es-modules/Series/Column/ColumnSeries.js';
import ColumnDataLabel from 'highcharts/es-modules/Series/Column/ColumnDataLabel.js';
import { Router } from '@angular/router';
let componentContext;


@Component({
  selector: 'analytics-graph-widget',
  templateUrl: './analytics-graph-widget.component.html',
  styleUrls: ['./analytics-graph-widget.component.scss']
})
export class AnalyticsGraphWidgetComponent implements OnInit {
  chartOptions = {};
  @Input() chartType;
  @Input() filterData: Array<any>;
  @Input() categoryId: any;
  @Input() categoryName: string;
  @Input() graphData;
  @Input() isL2CategoryCheck;
  @Input() productStaticData;
  fragmentPriceObject: any;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
  readonly attributeChartId = 'attribute-chart';
  readonly priceChartId = 'price-chart';
  readonly brandChartId = 'brand-chart';

  brandName: '';
  bucketData: any;
  attributeLength: any;
  attributeName:any;

  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;


  constructor(private dataService: DataService, private commonService: CommonService, private _productListService: ProductListService,public router:Router) {
    
   }

  ngOnInit(): void {
    componentContext = this;
    this.getData();
    ColumnDataLabel.compose(ColumnSeries);
  }
  
  getData(){
    if(this.graphData && this.graphData.length > 0){
    this.graphData.forEach(element => {
      if (element.block_name == 'attribute_report'){
        this.loadAttributeData(element);
      }
      else if (element.block_name == 'product_report') {
        this.loadPriceData(element);
      }
      else {
        this.loadBrandData(element);
       }
      });
    }
  }
  private loadAttributeData(element: any) {
    if (element.data && element.data.length > 0) {
      this.attributeDataWithoutProcessing = element.data;
      element.data.forEach((item, index) => {
        setTimeout(() => {
          let attributeName = item.attributeName;
          // this.getMaxValue(item['attributePercentange']);
          this.loadChart(`${this.attributeChartId}${index}`,item['attributePercentange'], this.prepareAttributeChartData(item['attributePercentange']), attributeName);
          return;
        }, 0);
      });
    }
  }

  private loadPriceData(element: any) {
    let priceData = [];
    if (element.data && element.data.length > 0) {
      this.priceDataWithoutProcessing = element.data;
      element.data.forEach(price => {
        priceData = [...priceData, ...this.preparePriceChartData(price)];
      });
      setTimeout(() => {
        this.loadChart(this.priceChartId, priceData, priceData);
      }, 10);
    }
  }

  private loadBrandData(element: any) {
    if (element.data && element.data.length > 0) {
      let brandData = [];
      this.brandDataWithoutProcessing = element.data;
      element.data.forEach(brand => {
        brandData = [...brandData, ...this.prepareBrandChartData(brand)];
      });
      setTimeout(() => {
        this.loadChart(this.brandChartId, brandData, brandData);
      }, 20);
    }
  }

  //create Chart Data
  prepareAttributeChartData(attributeData) {
    const seriesAttributeArray = [];
    for(var attr in attributeData) {
      let itemObj = {};
      itemObj['name'] = attr.toString();
      itemObj['y'] = attributeData[attr];
      itemObj['drilldown'] = null;
      seriesAttributeArray.push(itemObj);
    }
    return seriesAttributeArray;
  }

  prepareBrandChartData(brandData) {
    const seriesBrandArray = [];
    let brandObj = {};
    brandObj['name'] = brandData['brandName'].toString();
    brandObj['y'] = brandData['orderPercentage'];
    brandObj['drilldown'] = null;
    if(this.isL2CategoryCheck){
      brandObj['link'] = brandData['link'];
    }
    else{
      brandObj['brandCategoryLink'] = brandData['brandCategoryLink'];
    }
    seriesBrandArray.push(brandObj);
    return seriesBrandArray;
  }

  preparePriceChartData(priceData) {
  
    const seriesPriceArray = [];
    let priceObj = {};
    if(this.isL2CategoryCheck === true){
      priceObj['name'] = priceData['categoryName'];
    }  
    else{
      priceObj['name'] = this.formatPrice(priceData['interval'],true);
    }
    priceObj['y'] = priceData['orderPercentage'];
    priceObj['drilldown'] = null;
    priceObj['link'] =  priceData['categoryLink'];
    

    seriesPriceArray.push(priceObj);
    return seriesPriceArray;
  }
  // function to get Max Value in data
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

  createAttributeChartOptionsObject(data,seriesArray,attributeName?) {
    if (seriesArray.length > 0) {
      seriesArray[0].events = {
        click: function () {
          componentContext.generateFragmentUrl(attributeName, this.name);
        }
      };
      seriesArray[0].className = 'cursor-pointer';
    }
    let chartOptions = {
      chart: {
        type: 'column',
        width: 270,
        height:300,
      },
      title: {
        align: 'left',
        text: ''
      },
      subtitle: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false,
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text:'Order Percentage'
        }
      },
      legend: {
        enabled: true,
        className:'hideBubble'
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y}%'
          },
          events: {
            legendItemClick: function() {
              // return false;
             
            }
          }
        }
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}%</b> of total<br/>'
      },
      series: [
        {
          name: attributeName,
          colorByPoint: true,
        //   dataSorting: {
        //     enabled: true
        //  },
          data: seriesArray,
        }
      ]
    }
    return chartOptions;
  }
  createChartBrandSingleObject(data, seriesArray) {
    let chartOptions = {
      chart: {
        type: 'column',
        height:300
      },
      title: {
        align: 'left',
        text: ''
      },
      subtitle: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false,
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text:'Order Percentage'
        }
      },
      legend: {
        enabled: true,
        className:'hideBubble'
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y}%'
          },
          point:{
            events: {
              click: function () {
                // if(this.options.link == null || this.options.brandCategoryLink == null){
                //   return;
                // }
                if(componentContext.isL2CategoryCheck === true){
                  if(this.options.link == null){
                    return;
                  }
                  else{
                    componentContext.callRouter(this.options.link);
                  }
                }
                else{
                  if(this.options.brandCategoryLink == null){
                   return;
                  }
                  else{
                    componentContext.callRouter(this.options.brandCategoryLink);
                  }
                }
              }
            }
          }
        }
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}%</b> of total<br/>'
      },
      series: [
        {
          name: "Brands",
          colorByPoint: true,
          // dataSorting: {
          //   enabled: true
          // },
          data: seriesArray
        }
      ]
    }
    return chartOptions;
  }
  
  createChartPriceSingleObject(data, seriesArray) {
    let chartOptions = {
      chart: {
        type: 'column',
        height:300,
      },
      title: {
        align: 'left',
        text: ''
      },
      subtitle: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false,
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text:'Order Percentage'
        }
      },
      legend: {
        enabled: true,
        className:'hideBubble'
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y}%'
          },
          point:{
            events: {
              click: function () {
                if(componentContext.isL2CategoryCheck === true){
                  componentContext.callRouter(this.options.link);
                }
                else{
                  componentContext.generateFragmentUrl('price',componentContext.removeRupeeSymbol(this.options.name))
               }
              }
            }
          }
        }
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}%</b> of total<br/>'
      },
      series: [
        {
          name: (this.isL2CategoryCheck)?"Categories":"Price Range",
          colorByPoint: true,
          // dataSorting: {
          //   enabled: true
          // },
          data: seriesArray
        }
      ]
    }
    return chartOptions;
  }
   
  loadChart(htmlId, data, seriesData,attributeName?){
   
    if (htmlId.startsWith(`${this.priceChartId}`)) {
      const myChart1 = new Chart(htmlId ,this.createChartPriceSingleObject(data,seriesData));
      
    }
    if (htmlId.startsWith(`${this.attributeChartId}`)) {
      const myChart2 = new Chart(htmlId ,this.createAttributeChartOptionsObject(data,seriesData,attributeName));
    }
    if (htmlId.startsWith(`${this.brandChartId}`)) {
      const myChart3 = new Chart(htmlId ,this.createChartBrandSingleObject(data,seriesData));
    }
  }

  generateFragmentUrl(filterName, filterValue){
    // console.log("filterName",filterName,"filterValue",filterValue)
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
   callRouter(link){
     this.router.navigateByUrl(link);
   }
   removeRupeeSymbol(inputString) {
    return inputString.replace(/₹/g, '');
  }
}

