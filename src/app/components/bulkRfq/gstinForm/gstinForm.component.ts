import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { Step } from '@app/utils/validators/step.validate';

@Component({
	selector: 'gstinForm',
	templateUrl: './gstinForm.component.html',
	styleUrls: ['./gstinForm.component.scss']
})
export class GstinForm implements OnInit
{
onSubmit() {
	this.setGstinForm$.emit(this.gstinForm.value);
	this.moveToNext(this.stepNameConfimation)
    }
	gstinForm: FormGroup;
	@Output() moveToNext$: EventEmitter<any> = new EventEmitter<any>();
    @Input('bulkrfqForm') bulkrfqForm: String;
	@Output() setGstinForm$: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

	readonly stepNameLogin = 'LOGIN';
	readonly stepNameConfimation = 'CONFIRMATION';

	constructor(
		private formBuilder: FormBuilder,
		private _localAuthService: LocalAuthService
	) { 
		this.createGstinForm();
	}

	ngOnInit(): void {}

	createGstinForm() {
		const userSession = this._localAuthService.getUserSession();
		this.gstinForm = this.formBuilder.group({
		  gstin: [
			"",
			[
			  Validators.required,
			  Validators.pattern(
				"[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}"
			  ),
			],
		  ],
		  email: [
			userSession && userSession["email"] ? userSession["email"] : "",
			[Validators.required, Step.validateEmail],
		  ],
		  description: [""],
		});
	  }

	  moveToNext(stepName) {
		this.moveToNext$.emit(stepName);
	}
}
