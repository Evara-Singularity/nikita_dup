import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import IdleTimer from '@app/utils/idleTimeDetect';
import { CommonService } from '@app/utils/services/common.service';



@Component({
  selector: 'idle-user-search-nudge',
  templateUrl: './Idle-user-search-nudge.component.html',
  styleUrls: ['./Idle-user-search-nudge.component.scss']
})
export class IdleUserSearchNudgeComponent implements OnInit, OnDestroy, AfterViewInit {

  timer: IdleTimer;
  @Input() headingKeyword: string;
  @Input() searchKeyword: string;
  enableNudge: boolean = true;

  constructor(
    public common: CommonService
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.timer = new IdleTimer({
      timeout: 10, //expired after 10 secs
      onTimeout: () => {
        // this.enableNudge = true;
      }
    });
  }

  openSearchPopup(){
    this.common.updateSearchPopup(this.searchKeyword);
  }

  ngOnDestroy() {
    this.timer.cleanUp()
  }

  close(){
    this.enableNudge = false;
  }
}
