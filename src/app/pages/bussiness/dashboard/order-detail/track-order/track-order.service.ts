import { Injectable } from '@angular/core';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class TrackOrderService {

  constructor(public dataService: DataService) { }
 
  groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
}
