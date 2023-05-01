import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'product-qa',
  templateUrl: './product-qa.component.html',
  styleUrls: ['./product-qa.component.scss']
})
export class ProductQaComponent {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input('questionAnswerList') questionAnswerList;
  @Output('askQuestion') askQuestion = new EventEmitter();
  @Output('handleFaqListPopup') handleFaqListPopup = new EventEmitter();
  constructor(private _commonService:CommonService,private _activatedRoute:ActivatedRoute){
  }
 
  ngOnInit(): void {
    this.getStaticSubjectData();

    this._activatedRoute.fragment.subscribe((fragment: string)=>{
      if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_QNA_HASH){
        this.handleFaqListPopup.emit()
      }
    })
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
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
