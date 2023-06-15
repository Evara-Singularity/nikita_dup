import { Component, OnInit , NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-promoted-brands-unit',
  templateUrl: './promoted-brands-unit.component.html',
  styleUrls: ['./promoted-brands-unit.component.scss']
})
export class PromotedBrandsUnitComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

@NgModule(
  {
    declarations:[PromotedBrandsUnitComponent],
    imports:[CommonModule],
    exports: [PromotedBrandsUnitComponent]
  }
)
export class PromotedBrandsUnitModule{}
