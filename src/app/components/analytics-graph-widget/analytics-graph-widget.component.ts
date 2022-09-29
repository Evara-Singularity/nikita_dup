import { PercentPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
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
  // graphData: Array<any> = [];
  chartOptions = {};
  @Input() chartType;
  @Input() filterData: Array<any>;
  @Input() categoryId: any;
  @Input() graphData;
  fragmentPriceObject: any;
  imagePath = CONSTANTS.IMAGE_ASSET_URL;

  brandName: '';
  bucketData: any;
  attributeLength: any;
  attributeName:any;

  priceDataWithoutProcessing;
  brandDataWithoutProcessing;
  attributeDataWithoutProcessing;


  constructor(private dataService: DataService, private commonService: CommonService, private _productListService: ProductListService) { }

  ngOnInit(): void {
    console.log("categoryId", this.categoryId);
    this.getData();
    console.log("graphData",this.graphData);
  }

  getData() {
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
                console.log("priceData", priceData);
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
  //create Chart Data
  prepareAttributeChartData(attributeData) {
    const seriesAttributeArray = [];
    for (var attr in attributeData) {
      let itemObj = {};
      itemObj['name'] = attr.toString();
      itemObj['y'] = attributeData[attr];
      itemObj['drilldown'] = null;
      seriesAttributeArray.push(itemObj);
    }
    return seriesAttributeArray;
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
    // console.log("priceData", priceData);
    const seriesPriceArray = [];
    // for(var price in priceData){
    let priceObj = {};
    priceObj['name'] = priceData['interval'].toString();
    priceObj['y'] = priceData['orderPercentage'];
    priceObj['drilldown'] = null;
    seriesPriceArray.push(priceObj);

    return seriesPriceArray;
  }
  createChartOptionsObject(data,seriesArray,attributeName?) {
    console.log(data,"data");
    let chartOptions = {
      chart: {
        type: 'column',
        width: 270,
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
  createChartSingleObject(data, seriesArray) {
    let chartOptions = {
      chart: {
        type: 'column'
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
          name: "Price Range",
          colorByPoint: true,
          data: seriesArray
        }
      ]
    }
    return chartOptions;
  }
 

  loadChart(htmlId, data, seriesData,attributeName?) {
    // console.log('graph info', htmlId, data, seriesData);
    var Highcharts = require('highcharts');
    // Load module after Highcharts is loaded
    require('highcharts/modules/exporting')(Highcharts);
    Highcharts.chart(
      htmlId,
      this.createChartSingleObject(data, seriesData)
    );
    if (htmlId.startsWith('attribute-chart')) {
      Highcharts.chart(
        htmlId,
        this.createChartOptionsObject(data,seriesData,attributeName)
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


