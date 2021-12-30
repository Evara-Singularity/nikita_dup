import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import IdleTimer from '@app/utils/idleTimeDetect';
import { CommonService } from '@app/utils/services/common.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'idle-user-search-nudge',
  templateUrl: './Idle-user-search-nudge.component.html',
  styleUrls: ['./Idle-user-search-nudge.component.scss']
})
export class IdleUserSearchNudgeComponent implements OnInit, OnDestroy, AfterViewInit {

  timer: IdleTimer;
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
      this.timer = new IdleTimer({
        timeout: 7, //expired after 7 secs
        onTimeout: () => {
          this._commonService.enableNudge = true;
        }
      });
    }
  }

  openSearchPopup() {
    this._commonService.updateSearchPopup(this.searchKeyword);
  }

  ngOnDestroy() {
    if (this._commonService.isBrowser) {
      this.timer.cleanUp();
      this.oosSimilarCardSunscription.unsubscribe();
    }
  }

  close() {
    this._commonService.enableNudge = false;
  }
}
