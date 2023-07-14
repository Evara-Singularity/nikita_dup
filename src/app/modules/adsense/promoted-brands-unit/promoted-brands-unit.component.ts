import { Component, Input } from '@angular/core';
import { PromotedBrandAd } from '@app/utils/models/adsense.model';
@Component({
  selector: 'adsense-promoted-brands-unit',
  templateUrl: './promoted-brands-unit.component.html',
  styleUrls: ['./promoted-brands-unit.component.scss']
})
export class PromotedBrandsUnitComponent {

  @Input() data: PromotedBrandAd[] | null = null;
  @Input() isPdpPage:boolean= false
  constructor() { }

}
