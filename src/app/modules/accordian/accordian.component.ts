import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { AccordiansDetails } from '@app/utils/models/accordianInterface';



@Component({
  selector: 'app-accordian',
  templateUrl: './accordian.component.html',
  styleUrls: ['./accordian.component.scss']
})
export class AccordianComponent implements OnInit {

  @Input() accordiansDetails: AccordiansDetails[] = [];
  @Output('outerRoutingEvent') outerRoutingEvent = new EventEmitter<any>();
  @Output() sendAnalyticsInfo: EventEmitter<any> = new EventEmitter<any>();
  prodUrl = CONSTANTS.PROD;
  currentOpenIndex = 0;
  isShown:Array<boolean>=[];

  constructor(
    public _router: Router,
  ) { }

  ngOnInit(): void { 
    this.isShown = new Array(this.accordiansDetails.length).fill(false);
    this.isShown[0]=true;
  }

  getUrlPathName(url) {
    const originSlash = /^https?:\/\/[^/]+\//i;
    return url.replace(originSlash, '');
  }

  accordianNav(url, outerNavRouteEvent, data) {
    if (outerNavRouteEvent) {
      const catData = {categoryId: data['category']['categoryId'], category: data.category};
      this.outerRoutingEvent.emit(catData);
      return;
    }
    this._router.navigate(['/' + url]);
  }

  changeTab(index) {
    let val = this.isShown[index];
    this.isShown = new Array(this.accordiansDetails.length).fill(false);
    if (this.currentOpenIndex === index) {
      this.isShown[index] = val;
    }
    this.currentOpenIndex = index;
    this.toggleShow(index);
  }
  toggleShow(index) {

    this.isShown[index] = !this.isShown[index];
  }
  
  triggerAnalyticsInfo(){
    this.sendAnalyticsInfo.emit();
  }
}
