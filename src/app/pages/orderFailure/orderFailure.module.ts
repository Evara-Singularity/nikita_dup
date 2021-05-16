import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./orderFailure";
import { OrderFailureComponent } from "./orderFailure.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [OrderFailureComponent],
  providers: [],
})
export class OrderFailureModule {}
