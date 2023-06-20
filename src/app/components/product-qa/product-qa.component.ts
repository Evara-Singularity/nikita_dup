import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'product-qa',
  templateUrl: './product-qa.component.html',
  styleUrls: ['./product-qa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductQaComponent {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input('questionAnswerList') questionAnswerList;
  @Output('askQuestion') askQuestion = new EventEmitter();
  @Output('handleFaqListPopup') handleFaqListPopup = new EventEmitter();
  constructor(private _commonService:CommonService, private cdr: ChangeDetectorRef, private _activatedRoute:ActivatedRoute){
  }
 
  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  ngAfterViewInit() {
    if (this._commonService.isBrowser) {
      setTimeout(() => {
        this.checkForFragment()
      }, 600);
    }
  }
    
    checkForFragment(){
      this._activatedRoute.fragment.subscribe((fragment: string)=>{
        if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_QNA_HASH){
          this.handleFaqListPopup.emit()
        }
      })
    }


  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
    });
  }
}


@NgModule({
  declarations: [
    ProductQaComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductQaComponent
  ]
})
export class ProductQaModule { }
