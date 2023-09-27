import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service'
import { Subscription } from 'rxjs';
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
  displayAddToCartAnimation: boolean=false;
  @Input() isHindiMode:boolean=false
  private subscriptionAddToCartAnimation: Subscription;

  constructor(
    private commonService:CommonService
  ) { }

  ngOnInit(): void {
    this.subscriptionAddToCartAnimation = this.commonService.displayAddToCartAnimation$.subscribe(
      value => {
        this.displayAddToCartAnimation = value
      }
    );
  }

  onClickButton() {
    this.onClick.emit(this.displayAddToCartAnimation);
    if (this.isPdpMainProduct && !this.displayAddToCartAnimation) {
      this.displayAddToCartAnimation=true;
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
  ngOnDestroy() {
    this.subscriptionAddToCartAnimation.unsubscribe();
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
