import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsGraphWidgetComponent } from './analytics-graph-widget.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';



@NgModule({
  declarations: [AnalyticsGraphWidgetComponent],
  imports: [
    CommonModule,
  ],
  exports:[
    AnalyticsGraphWidgetComponent
  ]
})
export class AnalyticsGraphWidgetModule { }
