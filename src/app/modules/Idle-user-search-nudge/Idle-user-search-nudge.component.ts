import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import IdleTimer from '@app/utils/idleTimeDetect';
import { CommonService } from '@app/utils/services/common.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'idle-user-search-nudge',
  templateUrl: './Idle-user-search-nudge.component.html',
  styleUrls: ['./Idle-user-search-nudge.component.scss']
})
export class IdleUserSearchNudgeComponent implements OnInit, OnDestroy, AfterViewInit {


  @Input() headingKeyword: string;
  @Input() searchKeyword: string;
  oosSimilarCardSunscription: Subscription = null;

  constructor(
    public _commonService: CommonService
  ) { }

  ngOnInit() {
    if (this._commonService.isBrowser) {
      this.oosSimilarCardSunscription = this._commonService.oosSimilarCard$.subscribe(res => {
        this._commonService.enableNudge = res;
      });
    }
  }

  ngAfterViewInit() {
    if (this._commonService.isBrowser) {
      // this._commonService.resetSearchNudgeTimer();
    }
  }

  openSearchPopup() {
    this._commonService.searchNudgeClicked.next(true)
    this._commonService.updateSearchPopup(this.searchKeyword);
  }

  ngOnDestroy() {
    if (this._commonService.isBrowser) {
      this.nudgeStopActivies();
      this.oosSimilarCardSunscription.unsubscribe();
    }
  }

  close() {
    this._commonService.enableNudge = false;
    this.nudgeStopActivies()
  }

  nudgeStopActivies() {
    this._commonService.idleNudgeTimer.cleanUpTimer();
    this._commonService.idleNudgeTimer.cleanLocalStorage();
  }

}
