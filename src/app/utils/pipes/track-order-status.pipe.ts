import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'trackOrderStatus'
})

export class TrackOrderStatusPipe implements PipeTransform {
  transform(value: Array<any>, requestType: any, orderStatus ,reverse?:boolean): any {
    let trackStatus = [];
    let i = 0;
    let furtherTrail = true;
    for (let key in value) {
      if (key) {
        if (requestType === 'forward' && orderStatus !== 'RETURN REJECTED' && orderStatus !== 'EXCHANGE REJECTED') {
          if (i < 4) {
            if (key === 'shipped') {
              trackStatus.push({ name: 'packed', date: '', barStatus: orderStatus === 'PACKED' ? true : value[key]['flag'] ? true : false });
            }
            trackStatus.push({ name: key === 'delivered' && !value[key]['flag'] ? 'eDelivery' : key, date: value[key]['date'], barStatus: value[key]['flag'] });            
          }
        } else if (i > 2) {
          if (orderStatus !== 'RETURN REJECTED' && orderStatus !== 'EXCHANGE REJECTED' && key !== "re_ex_rejected") {
            trackStatus.push({ name: (orderStatus !== 'RETURN REJECTED' && orderStatus !== 'EXCHANGE REJECTED') ? requestType + '_' + key : orderStatus === 'RETURN REJECTED' ? requestType + 'R_' + key : requestType + 'E_' + key, date: value[key]['date'], barStatus: value[key]['flag'] });
          } else if (orderStatus === 'RETURN REJECTED' || orderStatus === 'EXCHANGE REJECTED') {
            if (furtherTrail) {
              trackStatus.push({ name: (orderStatus !== 'RETURN REJECTED' && orderStatus !== 'EXCHANGE REJECTED') ? requestType + '_' + key : orderStatus === 'RETURN REJECTED' ? requestType + 'R_' + key : requestType + 'E_' + key, date: value[key]['date'], barStatus: true });
            }
            if (key === "re_ex_rejected") {
              furtherTrail = false;
            }
          }
        }
        i++;
      }
    }

    trackStatus = trackStatus.map((item, i) => {
      if (!item['barStatus']) {
        item['cClass'] = "grdashed";
      } else if (((requestType == 'return' || requestType == 'exchange') && i !== 0 && item['barStatus']) || ((orderStatus === 'RETURN REJECTED' || orderStatus === 'EXCHANGE REJECTED') && item['name'] !== 'Delivered' && i !== 0)) {
        item['cClass'] = "yellsolid";
      } else if (requestType == 'forward' && item['barStatus'] && (orderStatus !== 'RETURN REJECTED' && orderStatus !== 'EXCHANGE REJECTED')) {
        item['cClass'] = "grsolid";
      }
      return item;
    });
      return reverse ? trackStatus.reverse() : trackStatus;
  }
}

import { NgModule } from '@angular/core';

@NgModule({
  imports: [],
  exports: [TrackOrderStatusPipe],
  declarations: [TrackOrderStatusPipe],
  providers: [],
})
export class TrackOrderStatusPipeModule { }