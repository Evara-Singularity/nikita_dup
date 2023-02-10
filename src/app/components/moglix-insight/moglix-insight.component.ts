import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'moglix-insight',
  templateUrl: './moglix-insight.component.html',
  styleUrls: ['./moglix-insight.component.scss']
})
export class MoglixInsightComponent implements OnInit {

  constructor(
    public productService: ProductService,
  ) { }

  ngOnInit() {
    // this.getMoglixInsightData();
  }

  // getMoglixInsightData(){
  //   this.productService.getMoglixInsight().subscribe(res=>{
  //     console.log("nikita",res)
  //   })

  // }

}


@NgModule({
  declarations: [
    MoglixInsightComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    MoglixInsightComponent
  ]
})
export class MoglixInsightModule { }
