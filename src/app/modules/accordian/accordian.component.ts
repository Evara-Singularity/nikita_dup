import { Component, Input, OnInit } from '@angular/core';
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
  prodUrl = CONSTANTS.PROD;
  currentOpenIndex = 0;
  isShown:Array<boolean>=[];

  constructor(
    public _router: Router,
  ) { }

  ngOnInit(): void { 
    this.isShown[0]=true;
  }

  getUrlPathName(url) {
    const originSlash = /^https?:\/\/[^/]+\//i;
    return url.replace(originSlash, '');
  }

  accordianNav(url) {
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
}
