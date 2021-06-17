import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { FooterService } from '@app/utils/services/footer.service';

@Component({
    selector: 'app-general-feedback',
    templateUrl: './general-feedback.component.html',
    styleUrls: ['./general-feedback.component.scss']
})
export class GeneralFeedbackComponent implements OnInit
{
    feedbackForm = new FormGroup({

    })

    constructor(private footerService: FooterService, private _router: Router, private _activatedRoute: ActivatedRoute, private _commonService: CommonService) { }

    ngOnInit(): void
    {
        this._activatedRoute.data.subscribe(resolverData =>
        {
            this.initiallizeData(resolverData['feedback']);
        });
    }

    initiallizeData(response)
    {
        console.log(response);
    }
}
