import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function listValidator(list: string[]): ValidatorFn
{
    return (control: AbstractControl): ValidationErrors | null =>
    {
        const value = (control.value as string).trim();
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
    @Input("list") list: any[] = [];
    @Output("onSelect") onSelect: EventEmitter<any> = new EventEmitter()
    filteredList: any[] = [];

    constructor() { }

    ngOnInit(): void {}

    ngAfterViewInit(): void
    {
        if (this.control) {
            this.control.setValidators([Validators.required, listValidator(this.list)])
        }
    }
    
    filter(value: string)
    {
        if (value.length > 0) {
            value = value.toLowerCase();
            this.filteredList = this.list.filter((item) => (item as string).toLowerCase().includes(value));
        } else {
            this.filteredList = this.list;
        }
    }

    onClick(list)
    {
        this.control.setValue(list);
        this.onSelect.emit(list)
    }

    toggleListDisplay(flag)
    {
        setTimeout(() => { this.filteredList = flag ? this.list : []; }, 150);
    }

}

@NgModule({
    declarations: [ListAutocompleteComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [ListAutocompleteComponent]
})
export class ListAutocompleteModule { }

