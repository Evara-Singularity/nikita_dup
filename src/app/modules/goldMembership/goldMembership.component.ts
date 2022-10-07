import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { MockLottiePlayerModule } from '@app/components/mock-lottie-player/mock-lottie-player.module';
import { CommonService } from '@app/utils/services/common.service';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-goldMembership',
  templateUrl: './goldMembership.component.html',
  styleUrls: ['./goldMembership.component.scss']
})
export class GoldMembershipComponent implements OnInit {

  @Output() closePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closePopupOnOutsideClick: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(private commonService:CommonService) { }

  ngOnInit() {
  }

  closeGoldPopup(data) {
    this.closePopup.emit(data)
  }
  
  popupOnOutsideClick(data){
  this.closePopupOnOutsideClick.emit(data)
  }
  
  addLottieScript(){
		this.commonService.addLottieScriptSubject.subscribe(lottieInstance => {
			this.commonService.callLottieScript();
			lottieInstance.next();
		});
	}
  ngAfterViewInit(){
    this.commonService.callLottieScript();
    this.addLottieScript();
  }
}

@NgModule({
  declarations: [
    GoldMembershipComponent
  ],
  imports: [
    CommonModule,
    BottomMenuModule,
    MockLottiePlayerModule
  ],
  exports:[GoldMembershipComponent]
})
export class GoldMembershipModule { }

