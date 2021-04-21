import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./businessServer.routing";
import { BussinessServerComponent } from "./bussinessServer.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [BussinessServerComponent],
  exports: [],
  providers: [],
})
export class BusinessServerModule {}