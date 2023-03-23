import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationFormComponent } from './confirmationForm.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { SharedAuthModule } from '@app/modules/shared-auth-v1/shared-auth.module';
import { SimilarProductModule } from '@app/components/similar-products/similar-products.component';
import { ProductSkeletonsModule } from '@app/components/product-skeletons/product-skeletons.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';


@NgModule({
  declarations: [ConfirmationFormComponent],
  imports: [
        CommonModule,
        PopUpModule,
        SharedAuthModule,
        ReactiveFormsModule,
        ListAutocompleteModule,
        NumberDirectiveModule,
        SimilarProductModule,
        ProductSkeletonsModule,
        ObserveVisibilityDirectiveModule,
  ],
  exports: [ConfirmationFormComponent]
})
export class ConfirmationFormModule { }
