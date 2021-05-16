import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { InstallationComponent } from "./installationService.component";
import { InstallationServiceModule } from './installationService.routing';

@NgModule({
  imports: [
    InstallationServiceModule,
    RouterModule,
    CommonModule
  ],
  declarations: [
    InstallationComponent
  ],
  exports: [
    InstallationComponent
  ],
  providers: [
  ]
})
export class InstallationModule { }
