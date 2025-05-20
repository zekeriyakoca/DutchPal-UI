import {
  ApplicationRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  Injector,
  ComponentRef,
} from '@angular/core';
import { SelectionOptionsComponent } from '../components/selection-options/selection-options.component';

@Directive({
  selector: '[appShowSelectionOptions]',
  standalone: true,
})
export class ShowSelectionOptionsDirective {
  private componentRef: ComponentRef<SelectionOptionsComponent> | null = null;

  constructor(
    private el: ElementRef,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  @HostListener('mouseup')
  @HostListener('keyup')
  handleSelection() {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !this.el.nativeElement.contains(
        selection.anchorNode?.parentElement || selection.anchorNode
      )
    ) {
      this.destroyComponent();
      return;
    }
    const text = selection.toString().trim();

    if (!text) {
      this.destroyComponent();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    this.showComponent({
      top: rect.top + window.scrollY - 30,
      left: rect.right + window.scrollX,
    }, text);
  }

  private showComponent(position: { top: number, left: number }, selectedText: string) {
    if (this.componentRef) {
      this.componentRef.instance.position = position;
      this.componentRef.instance.visible = true;
      this.componentRef.instance.selectedText.set(selectedText);
      return;
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(SelectionOptionsComponent);
    this.componentRef = factory.create(this.injector);
    this.componentRef.instance.position = position;
    this.componentRef.instance.visible = true;
    this.componentRef.instance.selectedText.set(selectedText);

    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }


  private destroyComponent() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
