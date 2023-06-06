import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  constructor(private _commonService:CommonService, private cdr: ChangeDetectorRef){
  }
 
  ngOnInit(): void {
    this.getStaticSubjectData();
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
