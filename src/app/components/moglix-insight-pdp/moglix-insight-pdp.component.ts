import { Component, OnInit } from '@angular/core';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'moglix-insight-pdp',
  templateUrl: './moglix-insight-pdp.component.html',
  styleUrls: ['./moglix-insight-pdp.component.scss']
})
export class MoglixInsightPdpComponent implements OnInit {

  constructor(
    public productService: ProductService,
  ) { }

  ngOnInit() {
    this.getMoglixInsightData();
  }

  getMoglixInsightData(){
    this.productService.getMoglixInsight().subscribe((res)=>{
      console.log("nikita",res)
    })

  }
}
