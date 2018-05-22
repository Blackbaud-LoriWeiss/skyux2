import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl
} from '@angular/forms';
import {
  ContentChildren,
  forwardRef,
  QueryList,
  EventEmitter,
  Output,
  AfterContentInit,
  ChangeDetectorRef,
  Input,
  Component,
  Injector
} from '@angular/core';

import {
  SkyRadioComponent
} from '../radio.component';

// Keeps the radio group ids unique
let nextId = 0;

// tslint:disable:no-forward-ref no-use-before-declare
export const SKY_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SkyRadioGroupComponent),
  multi: true
};
// tslint:enable

export class SkyRadioChange {
  constructor(
    public source: SkyRadioComponent,
    public value: any) {}
}

@Component({
  selector: 'sky-radio-group',
  template: '<ng-content></ng-content>',
  exportAs: 'skyRadioGroup',
  providers: [SKY_RADIO_GROUP_CONTROL_VALUE_ACCESSOR]
})
export class SkyRadioGroupComponent implements AfterContentInit, ControlValueAccessor {
  private _value: any = undefined;
  private _name: string = `sky-radio-group-${nextId++}`;
  private _selected: SkyRadioComponent = undefined;
  private isInitialized: boolean = false;

  @Output() public readonly change: EventEmitter<SkyRadioChange> = new EventEmitter<SkyRadioChange>();

  // tslint:disable-next-line:no-forward-ref
  @ContentChildren(forwardRef(() => SkyRadioComponent), { descendants: true })
  private radios: QueryList<SkyRadioComponent>;
  // tslint:enable

  @Input()
  public get name(): string { return this._name; }
  public set name(value: string) {
    this._name = value;
    this.updateRadioButtonNames();
  }

  @Input()
  public get value(): any { return this._value; }
  public set value(newValue: any) {
    if (this._value !== newValue) {
      this._value = newValue;

      this.updateSelectedRadioFromValue();
      this.checkSelectedRadioButton();
    }
  }

  @Input()
  public get selected() { return this._selected; }
  public set selected(selected: SkyRadioComponent) {
    this._selected = selected;
    this.value = selected ? selected.value : undefined;
    this.checkSelectedRadioButton();
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private injector: Injector
  ) { }

  public checkSelectedRadioButton() {
    if (this._selected && !this._selected.checked) {
      this._selected.checked = true;
    }
  }

  public ngAfterContentInit() {
    this.isInitialized = true;

    // Set initial value to be checked
    let ngControl: NgControl = this.injector.get(NgControl);
    this._value = ngControl.value;
    this.updateSelectedRadioFromValue();
    this.checkSelectedRadioButton();
  }

  public touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  public emitChangeEvent(): void {
    if (this.isInitialized) {
      this.change.emit(new SkyRadioChange(this._selected!, this._value));
    }
  }

  public markRadiosForCheck() {
    if (this.radios) {
      this.radios.forEach(radio => radio.markForCheck());
    }
  }

  public writeValue(value: any) {
    this.value = value;
    this.changeDetector.markForCheck();
  }

  public registerOnChange(fn: (value: any) => void) {
    this.controlValueAccessorChangeFn = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  public controlValueAccessorChangeFn: (value: any) => void = () => {};

  public onTouched: () => any = () => {};

  private updateRadioButtonNames(): void {
    if (this.radios) {
      this.radios.forEach(radio => {
        radio.name = this.name;
      });
    }
  }

  private updateSelectedRadioFromValue(): void {
    const isAlreadySelected = this._selected && this._selected.value === this._value;

    if (this.radios && !isAlreadySelected) {
      this._selected = undefined;
      this.radios.forEach(radio => {
        radio.checked = this.value === radio.value;
        if (radio.checked) {
          this._selected = radio;
        }
      });
    }
  }
}
