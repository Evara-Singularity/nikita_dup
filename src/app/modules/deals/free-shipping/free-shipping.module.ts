import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FreeShippingRoutingModule } from "./free-shipping-routing.module";
import { FreeShippingComponent } from "./free-shipping.component";

@NgModule({
  declarations: [FreeShippingComponent],
  imports: [CommonModule, FreeShippingRoutingModule],
})
export class FreeShippingModule {}