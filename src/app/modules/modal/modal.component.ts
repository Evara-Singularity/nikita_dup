import { Component, OnInit, Input, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalService } from './modal.service';
import { ModalDirective } from './modal.directive';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
    @Input() iData: {};
    private childComponentRef:any;
    modals: {};
    @ViewChild(ModalDirective) modalHost: ModalDirective;
    private cDistryoyed = new Subject();
    showModal: boolean;
    modalClass:any;
    heightFull:boolean;
    showVideoOverlay:boolean;

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private _ms: ModalService) {
        this.modals = {};
        this.showModal = false;
    }

    ngOnInit(): void {
        this._ms.getModals()
        // .pipe(
        //     takeUntil(this.cDistryoyed),
        //     catchError((err) => {
        //         return of({status: false});
        //     }),
        //     map(data => data)
        // )
        .subscribe((data) => {
            console.log("ModalComponentdata",data);
             ;
            this.showModal = true;
            // Add Unique id for each toast in array
            //  ;
            let componentConfig = {
                inputs: data.inputs,
                outputs: data.outputs,
                mConfig: data.mConfig
            }
            // console.log(data);
            this.appendComponentTo(data.component, componentConfig);

            
            // document.getElementById('overlayVisible').classList.remove('hidden_desktop');
        });

    }

    ngOnDestroy() {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }

    public appendComponentTo(child: any, childConfig?: childConfig) {
        // Create a component reference from the component 
        /* const childComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(child)
            .create(this.injector); */

        //  ;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(child);

        // console.log(this.modalHost);
        const viewContainerRef = this.modalHost.viewContainerRef;
        viewContainerRef.clear();

        const childComponentRef = viewContainerRef.createComponent(componentFactory);

        childComponentRef.instance['closePopup$']
        .pipe(
            takeUntil(this.cDistryoyed)
        ).subscribe((data)=>{
            this.showModal = false;
            // console.log("Output event emmited");
            this.destroy();
        })
        // Attach the config to the child (inputs and outputs)
        this.attachConfig(childConfig, childComponentRef);

        this.childComponentRef = childComponentRef;
      
        console.log(childConfig,"childConfig");

        if(childConfig.mConfig){
            this.modalClass = childConfig.mConfig['className'];
            this.heightFull = childConfig.mConfig['heightFull'];
            this.showVideoOverlay = childConfig.mConfig['showVideoOverlay'];
            console.log(this.modalClass,"mt");
        }

        // Attach component to the appRef so that it's inside the ng component tree
        // this.appRef.attachView(childComponentRef.hostView);

        // Get DOM element from component
        /* const childDomElem = (childComponentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement; */

        // Append DOM element to the body
        /* document.getElementById(parentId).appendChild(childDomElem); */

    }

    private attachConfig(config, componentRef) {
        let inputs = config.inputs;
        let outputs = config.outputs;
        for (let key in inputs) {
            // console.log(key);
            componentRef.instance[key] = inputs[key];
        }
        for (let key in outputs) {
            // console.log(key);
            componentRef.instance[key] = outputs[key];
        }

    }

    private removeComponent() {
        // this.appRef.detachView(this.childComponentRef.hostView);
        this.modalHost.viewContainerRef.clear();
        this.childComponentRef.destroy();
    }

    destroy() {
        this.removeComponent();
        // document.getElementById('overlayVisible').classList.add('hidden_desktop');
    }
    
}


interface childConfig{
    inputs:object,
    outputs:object,
    mConfig:object
}
