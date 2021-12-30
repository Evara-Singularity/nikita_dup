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
  enableNudge: boolean = false;
  oosSimilarCardSunscription: Subscription = null;

  constructor(
    public common: CommonService
  ) { }

  ngOnInit() {
    if (this.common.isBrowser) {
      this.oosSimilarCardSunscription = this.common.oosSimilarCard$.subscribe(res => {
        this.enableNudge = res;
      });
    }
  }

  ngAfterViewInit() {
    if (this.common.isBrowser) {
      this.timer = new IdleTimer({
        timeout: 7, //expired after 7 secs
        onTimeout: () => {
          this.enableNudge = true;
        }
      });
    }
  }

  openSearchPopup() {
    this.common.updateSearchPopup(this.searchKeyword);
  }

  ngOnDestroy() {
    if(this.common.isBrowser){
      this.timer.cleanUp();
      this.oosSimilarCardSunscription.unsubscribe();
    }
  }

  close() {
    this.enableNudge = false;
  }
}
