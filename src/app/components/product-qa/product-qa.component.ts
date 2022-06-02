import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-qa',
  templateUrl: './product-qa.component.html',
  styleUrls: ['./product-qa.component.scss']
})
export class ProductQaComponent {
  @Input('questionAnswerList') questionAnswerList;
  @Output('askQuestion') askQuestion = new EventEmitter();
  @Output('handleFaqListPopup') handleFaqListPopup = new EventEmitter();
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
