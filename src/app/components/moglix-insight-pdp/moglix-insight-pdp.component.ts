import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, NgModule, OnInit } from '@angular/core';
// import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'moglix-insight-pdp',
  templateUrl: './moglix-insight-pdp.component.html',
  styleUrls: ['./moglix-insight-pdp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoglixInsightPdpComponent implements OnInit {
  @Input() data: any;
  constructor(
    // public productService: ProductService,
  ) { }

  ngOnInit() {
  }

  setDataMessage() {
  }
}

@NgModule({
  declarations: [MoglixInsightPdpComponent],
  imports: [
    CommonModule,
  ],
  exports: [MoglixInsightPdpComponent]

})
export class MoglixInsightPdpModule { }

