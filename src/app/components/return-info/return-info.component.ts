import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'app-return-info',
  templateUrl: './return-info.component.html',
  styleUrls: ['./return-info.component.scss']
})
export class ReturnInfoComponent implements OnInit {

  @Input() show: boolean = true;
  @Input() isBrandMsn: boolean;
  @Output() removed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToFAQ$: EventEmitter<boolean> = new EventEmitter<boolean>();
  readonly baseDomain = CONSTANTS.PROD;
  constructor(private _commonService: CommonService) {}
  ngOnInit(): void {
    this._commonService.setBodyScroll(null, false)
    // console.log(this.shareFbUrl);
  }

  hide() {
    this._commonService.setBodyScroll(null, true)
    this.show = false;
    this.removed.emit(true);
  }

}

@NgModule({
  declarations: [
    ReturnInfoComponent,
  ],
  imports: [CommonModule, BottomMenuModule],
})
export class ReturnInfoModule { }
