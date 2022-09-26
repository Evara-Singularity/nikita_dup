import { Component, Input, OnInit } from '@angular/core';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { environment } from 'environments/environment';

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
  categoryId:128110000
  brandName:'';
  bucketData:any;
  constructor(private dataService:DataService,private commonService:CommonService,private _productListService:ProductListService) { }

  ngOnInit(): void {
    this.getData();
  }
  
      
  callChartApi(){
    let url = "http://localhost:3000/graphData";
    return this.dataService.callRestful("GET", url);
  } 
  getData(){
    this.callChartApi().subscribe(res => {
      if(res[0].statusCode == 200){
        this.graphData = res[0]['data']; 
        this.graphData.forEach(element => {
          if(element.block_name == 'attribute_report'){
            element.data.forEach(item => {
                this.attributeData = item.attributePercentange;
                this.prepareAttributeChartData(this.attributeData);
                setTimeout(() => {
                  this.createChart('attribute');
                 }, 0);
            });
          }
          else if(element.block_name == 'product_report'){
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
      for (var attr in attributeData){
        let itemObj = {};
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
  preparePriceChartData(discountData){
    for(var brand in discountData){
      let discountbj = {};
      discountbj['name'] = discountData['interval'].toString();
      discountbj['y'] = discountData['orderPercentage'];
      discountbj['drilldown'] = null;
      this.seriesPriceArray.push(discountbj);
    }
  }
  createChartOptionsObject(data,seriesArray){
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
    if(showData == 'attribute'){
      Highcharts.chart('attribute-chart',
      this.createChartOptionsObject(this.attributeData,this.seriesAttributeArray));
    }
    if(showData == 'price'){
      Highcharts.chart('price-chart', 
      this.createChartOptionsObject(this.priceData,this.seriesPriceArray))
    }
    if(showData == 'brand'){
      Highcharts.chart('brand-chart', 
      this.createChartOptionsObject(this.brandData,this.seriesBrandArray))
    }
  }
  getBucketData(categoryId){
    let filter_url = environment.BASE_URL + '/' + 'CATEGORY' + ENDPOINTS.GET_BUCKET;
    if (this.categoryId) {
      filter_url += "?category=" + this.categoryId;
    }
    const params = { pageName:'CATEGORY'};
    const actualParams = this.commonService.formatParams(params);
    console.log("actualParams",actualParams);
    return this.dataService.callRestful("GET", filter_url, {
    params: actualParams,
    });
  }
  createFragment(categoryId,priceVal,filterVal){
    // let fragment = "";
    // fragment = fragment + "/" + priceVal + "-" + filter[keys[i]].join("||");
  }
  callFilterData() {
    this.bucketData = this.getBucketData(this.categoryId);
    console.log("this.bucketData",this.bucketData);
  };
  setDataForAnalyticsCategories(categoryID) {
    
  }
}


