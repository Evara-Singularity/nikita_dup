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
        if (this.brandList.length) {
            if (this.control) {
                this.control.setValidators([Validators.required, listValidator(this.brandList)])
            }
        }
        if (this.amountList.length) {
            if (this.control) {
                this.control.setValidators([Validators.required])
            }
        }
    }

    filter(value: string) {
        if (this.brandList.length) {
            if (value.length > 0) {
                value = value.toLowerCase();
                this.filteredList = this.brandList.filter((item) => (item as string).toLowerCase().includes(value));
            } else {
                this.filteredList = this.brandList;
            }
        }
        if (this.amountList.length) {
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
        setTimeout(() => { this.filteredList = flag ? this.brandList : []; }, 150);
    }

}

@NgModule({
    declarations: [ListAutocompleteComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [ListAutocompleteComponent]
})
export class ListAutocompleteModule { }

