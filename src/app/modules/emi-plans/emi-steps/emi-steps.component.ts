import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'emi-steps',
    templateUrl: './emi-steps.component.html',
    styleUrls: ['./emi-steps.component.scss']
})
export class EmiStepsComponent implements OnInit
{
    @Input() openEMIStepsPopup: boolean = false;
    @Output() out: EventEmitter<any> = new EventEmitter<any>();


    constructor() { }

    ngOnInit(): void
    {
    }

    outData(data)
    {
        this.out.emit(data);
    }

    closeEMISteps(data)
    {
        this.out.emit(data);
        this.openEMIStepsPopup = false;
    }

}
