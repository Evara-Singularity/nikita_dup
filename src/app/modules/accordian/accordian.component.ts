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

  @Input() accordiansDetails:AccordiansDetails[]=[];
  prodUrl=CONSTANTS.PROD;
  
  constructor(
    public _router: Router,
  ) { }

  ngOnInit(): void {}

  getUrlPathName(url) {
    const originSlash = /^https?:\/\/[^/]+\//i;
    return url.replace(originSlash, '');
  }

  accordianNav(url){
    this._router.navigate(['/'+url]);
}
}
