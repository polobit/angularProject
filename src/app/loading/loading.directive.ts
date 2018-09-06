import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { LoadingComponent } from './loading.component';

@Directive({
    selector: '[appLoading]'
})
export class LoadingDirective {
    loadingFactory: ComponentFactory<LoadingComponent>;
    loadingComponent: ComponentRef<LoadingComponent>;
    private hasView = false;

    constructor(private templateRef: TemplateRef<any>,
                private vcRef: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver) {
        this.loadingFactory = this.componentFactoryResolver.resolveComponentFactory(LoadingComponent);
    }

    @Input() set appLoading(loading: boolean) {
        this.vcRef.clear();
        if (loading) {
            this.vcRef.createEmbeddedView(this.templateRef);
        } else {
            this.loadingComponent = this.vcRef.createComponent(this.loadingFactory);
        }
    }
}
