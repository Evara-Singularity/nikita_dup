import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { OrderDetailComponent} from './order-detail.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TrackOrderModule } from './track-order/track-order.module';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
import { MathFloorPipeModule } from 'src/app/utils/pipes/math-floor';
import { ImageToSrcDirectiveModule } from 'src/app/utils/directives/imageToSrc.directive';
import { TrackOrderStatusPipeModule } from 'src/app/utils/pipes/track-order-status.pipe';
import { OrderDetailService } from './order-detail.service';

export const routes: Routes = [
    {
        path: ':id/:itemid',
        component: OrderDetailComponent,
    }
];

@NgModule({
   imports: [
      MathFloorPipeModule,
      FormsModule,
      CommonModule,
      ReactiveFormsModule,
      RouterModule.forChild(routes),
      PopUpModule,
      ImageToSrcDirectiveModule,
      TrackOrderStatusPipeModule,
      TrackOrderModule
   ],
   declarations: [
      OrderDetailComponent,
   ],
   providers: [
      OrderDetailService,
      DatePipe
   ]
})
export class OrderDetailModule { }
