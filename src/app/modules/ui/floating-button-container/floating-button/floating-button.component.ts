import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service'
@Component({
  selector: 'floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent implements OnInit {

  @Input() type: 'RED' | 'WHITE' = 'RED';
  @Input() isMultiple = true;
  @Input() label: string = 'Button';
  @Input() iconClass: string;
  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private commonService:CommonService
  ) { }

  ngOnInit(): void {
  }

  onClickButton() {
    this.onClick.emit();
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
    this.commonService.setBodyScroll(null, false);
  }
}

// @NgModule({
//   declarations: [
//     FloatingButtonComponent
//   ],
//   imports: [
//     CommonModule,
//     MockLottiePlayerModule
//   ],
//   exports:[
//     FloatingButtonComponent
//   ]
// })
// export class FloatingButtonModule { }
