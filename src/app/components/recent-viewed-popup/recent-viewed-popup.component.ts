import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, EventEmitter, Output } from '@angular/core';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '../../config/constants';

@Component({
  selector: 'app-recent-viewed-popup',
  templateUrl: './recent-viewed-popup.component.html',
  styleUrls: ['./recent-viewed-popup.component.scss']
})
export class RecentViewedPopupComponent implements OnInit {

  @Input() recentProductList: any = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Output() out: EventEmitter<any> =  new EventEmitter<any>();

  constructor(public commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
  }

  goToProducturl(url){
    this.router.navigateByUrl(url);
  }

  outData(data){
    this.out.emit(data);
  }

}

@NgModule({
  declarations: [
    RecentViewedPopupComponent
  ],
  imports: [
    CommonModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    PopUpModule
  ]
})
export class RecentViewedPopupModule { }
