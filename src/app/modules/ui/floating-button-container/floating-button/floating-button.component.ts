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
  @Input() isPdpMainProduct: boolean=false;
  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() displayAddToCartAnimation: boolean=false;
  @Input() isHindiMode:boolean=false
  lotteieInfo:boolean= false;

  constructor(
    private commonService:CommonService
  ) { }

  ngOnInit(): void {
  }

  onClickButton() {
    this.onClick.emit(this.lotteieInfo);
    if (this.isPdpMainProduct && !this.displayAddToCartAnimation && !this.lotteieInfo ) {
      this.displayAddToCartAnimation=true;
      this.lotteieInfo=true
    }
  }
  

  addLottieScript(){
		this.commonService.addLottieScriptGoToCartSubject.subscribe(lottieInstance => {
			this.commonService.callLottieScriptGoToCart();
			lottieInstance.next();
		});
	}
  ngAfterViewInit(){
    this.commonService.callLottieScriptGoToCart();
    this.addLottieScript();
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
