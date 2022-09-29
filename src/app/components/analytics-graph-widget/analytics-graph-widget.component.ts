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
  chartOptions = {};
  @Input() chartType;
  @Input() filterData: Array<any>;
  @Input() categoryId:any;
  fragmentPriceObject:any;
  
  brandName:'';
  bucketData:any;
  attributeLength:any;

  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;
  

  constructor(private dataService:DataService,private commonService:CommonService,private _productListService:ProductListService) { }

  ngOnInit(): void {
    console.log("categoryId",this.categoryId);
    this.getData();
  }
      
  callChartApi(){
    let url = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_ANALYTICS + "?categoryCode=" +this.categoryId;
    return this.dataService.callRestful("GET", url);
  } 

  getData(){
    this.callChartApi().subscribe(res => {
      if(res['statusCode'] == 200){
        this.graphData = res['data']; 
        this.graphData.forEach(element => {
          if(element.block_name == 'attribute_report'){
            if(element.data && element.data.length >0){
            this.attributeDataWithoutProcessing = element.data;
              element.data.forEach((item, index) => {
                setTimeout(() => {
                  this.loadChart(`attribute-chart${index}`,item['attributePercentange'], this.prepareAttributeChartData(item['attributePercentange']))
                },0);
             });
            }
          }
          else if(element.block_name == 'product_report'){
            let priceData = [];
            if(element.data && element.data.length >0){
            this.priceDataWithoutProcessing = element.data;
              element.data.forEach(price => {
                priceData = [...priceData, ...this.preparePriceChartData(price)]
                console.log("priceData",priceData);
              });
            
            setTimeout(() => {
              this.loadChart('price-chart',priceData,priceData);
             },10);
            }
          }
          else{
            if(element.data && element.data.length >0){
              let brandData = [];
              this.brandDataWithoutProcessing = element.data;
              element.data.forEach(brand => {
               brandData = [...brandData, ...this.prepareBrandChartData(brand)]
              });
              setTimeout(() => {
                this.loadChart('brand-chart',brandData,brandData);
               }, 20);
              }
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
    const seriesAttributeArray = [];
      for(var attr in attributeData){
        let itemObj = {};
        itemObj['name'] = attr.toString();
        itemObj['y'] = attributeData[attr];
        itemObj['drilldown'] = null;
        seriesAttributeArray.push(itemObj);
      }
    return seriesAttributeArray;
  }
  prepareBrandChartData(brandData){
  //  debugger;
    const seriesBrandArray = [];
      let brandObj = {};
      brandObj['name'] = brandData['brandName'].toString();
      brandObj['y'] = brandData['orderPercentage'];
      brandObj['drilldown'] = null;
      seriesBrandArray.push(brandObj);
    
    return seriesBrandArray; 
  }  
  
  preparePriceChartData(priceData){
    console.log("priceData",priceData);
    const seriesPriceArray = [];
    // for(var price in priceData){
      let priceObj = {};
      priceObj['name'] = priceData['interval'].toString();
      priceObj['y'] = priceData['orderPercentage'];
      priceObj['drilldown'] = null;
      seriesPriceArray.push(priceObj);
    
    return seriesPriceArray; 
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

  createCHartAttribute(attributeData, graphData){
    this.createChartOptionsObject(attributeData,graphData);
  }

  loadChart(htmlId, data, seriesData){
    console.log('graph info', htmlId , data, seriesData);
    var Highcharts = require('highcharts');  
    // Load module after Highcharts is loaded
    require('highcharts/modules/exporting')(Highcharts); 
    Highcharts.chart(
      htmlId,
      this.createChartOptionsObject(data,seriesData)
    );
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


