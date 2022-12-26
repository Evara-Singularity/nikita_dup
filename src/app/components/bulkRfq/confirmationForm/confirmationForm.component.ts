import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedAuthService } from '@app/modules/shared-auth-v1/shared-auth.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
	selector: 'confirmationForm',
	templateUrl: './confirmationForm.component.html',
	styleUrls: ['./confirmationForm.component.scss']
})
export class ConfirmationFormComponent implements OnInit
{
	@Output() moveToNext$: EventEmitter<any> = new EventEmitter<any>();
    @Input('bulkrfqForm') bulkrfqForm: String;
	@Input('gstinForm') gstinForm: String;
	readonly stepNameLogin = 'LOGIN';

	constructor() {}

	ngOnInit(): void {}

    moveToNext(stepName) {
		this.moveToNext$.emit(stepName);
	}
}
