import { Component, Input, OnInit } from '@angular/core';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { environment } from 'environments/environment';
import { filter } from 'rxjs-compat/operator/filter';

@Component({
  selector: 'analytics-graph-widget',
  templateUrl: './analytics-graph-widget.component.html',
  styleUrls: ['./analytics-graph-widget.component.scss']
})
export class AnalyticsGraphWidgetComponent implements OnInit {
  graphData :Array<any>=[];
  seriesAttributeArray: Array<any>= [];
  seriesBrandArray: Array<any> = [];
  seriesPriceArray: Array<any> = [];
 
  attributeData:any;
  brandData:any;
  priceData:any;
  chartOptions = {};
  @Input() chartType;
  @Input() filterData: Array<any>;
  @Input() categoryId:any;
  fragmentPriceObject:any;
  
  brandName:'';
  bucketData:any;
  singleAttributeData:any;

  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;

  constructor(private dataService:DataService,private commonService:CommonService,private _productListService:ProductListService) { }

  ngOnInit(): void {
    this.getData();
  }
      
  callChartApi(){
    // let url = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_ANALYTICS + "?categoryCode=" +129000000;
    let url = 'http://localhost:3000/graphData';
    return this.dataService.callRestful("GET", url);
  } 
  getData(){
    this.callChartApi().subscribe(res => {
      if(res[0].statusCode == 200){
        this.graphData = res[0]['data']; 
        this.graphData.forEach(element => {
          if(element.block_name == 'attribute_report'){
            // element.data.forEach(item => {
            //     this.attributeDataWithoutProcessing = element.data;
            //      this.attributeDataWithoutProcessing.forEach((attributeChart,i) => {
            //       //  debugger;
            //        this.attributeData = attributeChart.attributePercentange;
            //        this.prepareAttributeChartData(this.attributeData);
            //        this.createChart('attribute'+i);
            //      });
            // });
          }
          else if(element.block_name == 'product_report'){
            this.priceDataWithoutProcessing = element.data;
            element.data.forEach(price => {
              this.priceData = price;
              this.preparePriceChartData(this.priceData);
              setTimeout(() => {
                this.createChart('price');
               }, 0);
            });
          }
          else{
            element.data.forEach(brand => {
              this.brandDataWithoutProcessing = element.data;
              this.brandData = brand;
              this.prepareBrandChartData(this.brandData);
              setTimeout(() => {
                this.createChart('brand');
               }, 0);
            });
          }
        });
       }
       else{
         console.log("error");
       }
    });
  }
  //create Chart Data
  prepareAttributeChartData(attributeData){
    // debugger;
    let itemObj = {};
      for(var attr in attributeData){
        itemObj['name'] = attr.toString();
        itemObj['y'] = attributeData[attr];
        itemObj['drilldown'] = null;
        this.seriesAttributeArray.push(itemObj);  
      }
      
  }
  prepareBrandChartData(brandData){
    for (var brand in brandData){
      let brandObj = {};
      brandObj['name'] = brandData['brandName'].toString();
      brandObj['y'] = brandData['orderPercentage'];
      brandObj['drilldown'] = null;
      this.seriesBrandArray.push(brandObj);
    }
  }  
  preparePriceChartData(priceData){
    for(var price in priceData){
      let priceObj = {};
      priceObj['name'] = priceData['interval'].toString();
      priceObj['y'] = priceData['orderPercentage'];
      priceObj['drilldown'] = null;
      this.seriesPriceArray.push(priceObj);
    }
  }
  createChartOptionsObject(data,seriesArray){
    // debugger;
    let chartOptions = {
          chart: {
              type: 'column'
          },
          title: {
              align: 'left',
              text: 'Browser market shares. January, 2022'
          },
          subtitle: {
              align: 'left',
              text: 'Click the columns to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
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
                  text: data
              }
          },
          legend: {
              enabled: false
          },
          plotOptions: {
              series: {
                  borderWidth: 0,
                  dataLabels: {
                      enabled: true,
                      format: '{point.y:.1f}%'
                  }
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
              pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
              {
                  name: "Browsers",
                  colorByPoint: true,
                  data:seriesArray
              }
          ]
      } 
      return chartOptions; 
  }
  createChartOptionsMultileObject(data,seriesArray){
    // debugger;
    let chartOptions = {
          chart: {
              type: 'column'
          },
          title: {
              align: 'left',
              text: 'Browser market shares. January, 2022'
          },
          subtitle: {
              align: 'left',
              text: 'Click the columns to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
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
                  text: data
              }
          },
          legend: {
              enabled: false
          },
          plotOptions: {
              series: {
                  borderWidth: 0,
                  dataLabels: {
                      enabled: true,
                      format: '{point.y:.1f}%'
                  }
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
              pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
              {
                  name: "Browsers",
                  colorByPoint: true,
                  data:seriesArray
              }
          ]
      } 
      return chartOptions; 
  }
  createChart(showData:string){
    var Highcharts = require('highcharts');  
    // Load module after Highcharts is loaded
    require('highcharts/modules/exporting')(Highcharts);  
    if(showData == 'attribute0'){
      Highcharts.chart('attribute-chart0',
      this.createChartOptionsMultileObject(this.attributeData,this.seriesAttributeArray));
    }
    // if(showData == 'attribute1'){
    //   Highcharts.chart('attribute-chart1',
    //   this.createChartOptionsObject(this.attributeData,this.seriesAttributeArray));
    // }
    // if(showData == 'attribute2'){
    //   Highcharts.chart('attribute-chart2',
    //   this.createChartOptionsObject(this.attributeData,this.seriesAttributeArray));
    // }
    if(showData == 'price'){
      Highcharts.chart('price-chart', 
      this.createChartOptionsObject(this.priceData,this.seriesPriceArray))
    }
    if(showData == 'brand'){
      Highcharts.chart('brand-chart', 
      this.createChartOptionsObject(this.brandData,this.seriesBrandArray))
    }
  }
 
  generateFragmentUrl(filterName,filterValue){
    let fragmentPriceObject = {};
     if(filterName == 'price'){
      fragmentPriceObject['price'] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject; 
      this.commonService.applyFilter();
     }
     else if(filterName == 'brand'){
      let fragmentBrandObject = {
        'brand': [filterValue.toString()]
      }
      fragmentPriceObject['brand'] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject; 
      this.commonService.applyFilter();
     }
    else{
      fragmentPriceObject[filterName] = [filterValue.toString()];
      this.commonService.selectedFilterData.filter = fragmentPriceObject; 
      this.commonService.applyFilter();
    }
  }

  formatPrice(value:string){
    let formatValue = value.split(',');
    return (formatValue[0]+'-'+formatValue[1]);
  }
}


