import { PercentPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';



@Component({
  selector: 'analytics-graph-widget',
  templateUrl: './analytics-graph-widget.component.html',
  styleUrls: ['./analytics-graph-widget.component.scss']
})
export class AnalyticsGraphWidgetComponent implements OnInit {
  // graphData: Array<any> = [];
  chartOptions = {};
  @Input() chartType;
  @Input() filterData: Array<any>;
  @Input() categoryId: any;
  @Input() categoryName: string;
  @Input() graphData;
  fragmentPriceObject: any;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

  brandName: '';
  bucketData: any;
  attributeLength: any;
  attributeName:any;

  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;


  constructor(private dataService: DataService, private commonService: CommonService, private _productListService: ProductListService) { }

  ngOnInit(): void {
    this.getData();
  }
  getData(){
    if(this.graphData && this.graphData.length > 0){
    this.graphData.forEach(element => {
      if (element.block_name == 'attribute_report'){
        if (element.data && element.data.length > 0) {
          this.attributeDataWithoutProcessing = element.data;
          element.data.forEach((item, index) => {
            setTimeout(() => {
              let attributeName = item.attributeName;
              this.loadChart(`attribute-chart${index}`, item['attributePercentange'], this.prepareAttributeChartData(item['attributePercentange']),attributeName)
              return 
            }, 0);
          });
        }
      }
      else if (element.block_name == 'product_report') {
        let priceData = [];
        if (element.data && element.data.length > 0) {
          this.priceDataWithoutProcessing = element.data;
          element.data.forEach(price => {
            priceData = [...priceData, ...this.preparePriceChartData(price)]
          });

          setTimeout(() => {
            this.loadChart('price-chart', priceData, priceData);
          }, 10);
        }
      }
      else {
        if (element.data && element.data.length > 0) {
          let brandData = [];
          this.brandDataWithoutProcessing = element.data;
          element.data.forEach(brand => {
            brandData = [...brandData, ...this.prepareBrandChartData(brand)]
          });
          setTimeout(() => {
            this.loadChart('brand-chart', brandData, brandData);
          }, 20);
        }
       }
      });
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
    // this.maxValue(seriesAttributeArray);
    return seriesAttributeArray;
  }

  maxValue(seriesAttributeArray){
    let maxValue = 0;
    let maxAttributeName;
    for(var i=0;i<seriesAttributeArray.length;i++){
        if(seriesAttributeArray[i].y>maxValue){
          maxValue = seriesAttributeArray[i].y;
          maxAttributeName = seriesAttributeArray[i].name;
       }
    }
    return maxValue;
  }

  prepareBrandChartData(brandData) {
    //  debugger;
    const seriesBrandArray = [];
    let brandObj = {};
    brandObj['name'] = brandData['brandName'].toString();
    brandObj['y'] = brandData['orderPercentage'];
    brandObj['drilldown'] = null;
    seriesBrandArray.push(brandObj);
    return seriesBrandArray;
  }

  preparePriceChartData(priceData) {
    const seriesPriceArray = [];
    
    let priceObj = {};
    priceObj['name'] = priceData['interval'].toString();
    priceObj['y'] = priceData['orderPercentage'];
    priceObj['drilldown'] = null;
    seriesPriceArray.push(priceObj);

    return seriesPriceArray;
  }
  createChartOptionsObject(data,seriesArray,attributeName?) {
    let chartOptions = {
      chart: {
        type: 'column',
        width: 270,
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
        type: 'category'
      },
      yAxis: {
        title: {
          text:'Order Percentage'
        }
      },
      legend: {
        enabled: true
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
          name: attributeName,
          colorByPoint: true,
          data: seriesArray
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
          name: "Brands",
          colorByPoint: true,
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
          name: "Price Range",
          colorByPoint: true,
          data: seriesArray
        }
      ]
    }
    return chartOptions;
  }
  loadChart(htmlId, data, seriesData,attributeName?) {
    var Highcharts = require('highcharts');
    // Load module after Highcharts is loaded
    require('highcharts/modules/exporting')(Highcharts);
    Highcharts.chart(
      htmlId,
      this.createChartPriceSingleObject(data, seriesData)
    );
    if (htmlId.startsWith('attribute-chart')) {
      Highcharts.chart(
        htmlId,
        this.createChartOptionsObject(data,seriesData,attributeName)
      );
    }
    if (htmlId.startsWith('brand')) {
      Highcharts.chart(
        htmlId,
        this.createChartBrandSingleObject(data,seriesData)
      );
    }
  }
  generateFragmentUrl(filterName, filterValue) {
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

  formatPrice(value: string) {
    let formatValue = value.split(',');
    return (formatValue[0] + '-' + formatValue[1]);
  }
}


