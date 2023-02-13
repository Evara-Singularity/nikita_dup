import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'moglix-insight-pdp',
  templateUrl: './moglix-insight-pdp.component.html',
  styleUrls: ['./moglix-insight-pdp.component.scss']
})
export class MoglixInsightPdpComponent implements OnInit {
  @Input() data: any;
  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  getMoglixInsightData(){
    // this.productService.getMoglixInsight().subscribe((res)=>{
    //   console.log("nikita",res)
    // })
  }
}

@NgModule({
  declarations: [MoglixInsightPdpComponent],
  imports: [
    CommonModule,
    // MoglixInsightPdpRoutingModule
  ],
  exports:[MoglixInsightPdpComponent]
  
})
export class MoglixInsightPdpModule { }

