import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function listValidator(list: string[]): ValidatorFn
{
    return (control: AbstractControl): ValidationErrors | null =>
    {
        const value = (control.value.toString()).trim();
        return list.includes(value) ? null : { "not-found": "invalid selection name" }
    };
}


@Component({
    selector: 'list-autocomplete',
    templateUrl: './list-autocomplete.component.html',
    styleUrls: ['./list-autocomplete.component.scss']
})
export class ListAutocompleteComponent implements OnInit
{
    @Input("control") control: FormControl;
    @Input("placeholder") placeholder: string;
    @Input("brandList") brandList: any[] = [];
    @Input("amountList") amountList: any[] = [];
    @Output("onSelect") onSelect: EventEmitter<any> = new EventEmitter()
    filteredList: any[] = [];

    constructor() { }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        if (this.brandList.length && this.control) {         //for case brands
            this.control.setValidators([Validators.required, listValidator(this.brandList)])
        }
        else if (this.amountList.length && this.control) {   //for case amount
            this.control.setValidators([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.min(1)])
        }
    }

    filter(value: string) {
        if (this.brandList.length) {          //for case brands
            if (value.length > 0) {
                value = value.toLowerCase();
                this.filteredList = this.brandList.filter((item) => (item as string).toLowerCase().includes(value));
            } else {
                this.filteredList = this.brandList;
            }
        }
        else if (this.amountList.length) {    //for case amount
            if (value.length > 0) {
                this.filteredList = this.amountList.filter((item) => (item.toString()).includes(value));
            } else {
                this.filteredList = this.amountList;
            }
        }
    }

    onClick(list)
    {
        this.control.setValue(list);
        this.onSelect.emit(list)
    }

    toggleListDisplay(flag)
    {
        if(this.brandList.length)              //for case brands
        setTimeout(() => { this.filteredList = flag ? this.brandList : []; }, 150);

        else if(this.amountList.length)        //for case amount
        setTimeout(() => { this.filteredList = flag ? this.amountList : []; }, 150);
    }

}

@NgModule({
    declarations: [ListAutocompleteComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [ListAutocompleteComponent]
})
export class ListAutocompleteModule { }

