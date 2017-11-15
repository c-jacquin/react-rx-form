import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { FieldValue, InputEvent, FormValues } from '../types'
import { createInputObservable, createSelectObservable } from 'observable/factory'
import autobind from 'autobind-decorator'

export interface InputObservableParams {
  checkboxEvent?: string
  textEvent?: string
  radioEvent?: string
  selectEvent?: string
  initialValue?: FormValues
  selectElements?: HTMLSelectElement[]
  inputElements?: HTMLInputElement[]
}

export class InputObservable extends BehaviorSubject<FormValues> {
  static TEXT_INPUT = ['text', 'search', 'email', 'password']
  static RADIO_INPUT = ['radio']
  static CHECKBOX_INPUT = ['checkbox']

  checkboxEvent?: string
  textEvent?: string
  radioEvent?: string
  selectEvent?: string

  text$: Observable<FormValues>
  radio$: Observable<FormValues>
  checkbox$: Observable<FormValues>
  subscriptions: Subscription[] = []

  constructor({
    inputElements = [],
    selectElements = [],
    initialValue = {},
    checkboxEvent = 'change',
    textEvent = 'input',
    radioEvent = 'change',
    selectEvent = 'change',
  }: InputObservableParams) {
    super(initialValue)

    this.checkboxEvent = checkboxEvent
    this.textEvent = textEvent
    this.radioEvent = radioEvent
    this.selectEvent = selectEvent

    if (inputElements.length > 0 || selectElements.length > 0) {
      this.addInputs(inputElements, selectElements)
    }
  }

  /**
   * unsubscribe to all the subscribed Observable
   */
  unsubscribe(): void {
    super.unsubscribe()
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  /**
   * transform the data from the inputs observable
   * @param fieldName - the name of the input
   * @param value - the value of the input
   * @param dirty - indicate if the field has a value
   * @param touched - indicate if the user already fill something
   */
  reduceField(fieldName: string, value: FieldValue, dirty = true, touched = true): FormValues {
    return {
      [fieldName]: {
        dirty,
        touched,
        value,
      },
    }
  }

  /**
   * standard input data formatter (input text, radioButton, select)
   * @param event - input or change event
   */
  @autobind
  standardInputFormatter(event: InputEvent | any): FormValues {
    return this.reduceField(event.target.name, event.target.value)
  }

  /**
   * formatter for the checkbox
   * @param event - change event
   */
  @autobind
  checkboxInputFormatter(event: InputEvent | any): FormValues {
    return this.reduceField(event.target.name, !!event.target.checked)
  }

  @autobind
  handleSubscribe(formValues: FormValues) {
    this.next({
      ...this.getValue(),
      ...formValues,
    })
  }

  /**
   * add new observable inputs to the InputObservable
   * @param inputElements - the inputElement to add
   */
  addInputs(inputElements: HTMLInputElement[], selectElements: HTMLSelectElement[] = []): void {
    const text$ = createInputObservable({
      elements: inputElements,
      event: this.textEvent,
      types: InputObservable.TEXT_INPUT,
    }).map(this.standardInputFormatter)

    const radio$ = createInputObservable({
      elements: inputElements,
      event: this.radioEvent,
      types: InputObservable.RADIO_INPUT,
    }).map(this.standardInputFormatter)

    const checkbox$ = createInputObservable({
      elements: inputElements,
      event: this.checkboxEvent,
      types: InputObservable.CHECKBOX_INPUT,
    }).map(this.checkboxInputFormatter)

    const select$ = createSelectObservable({ elements: selectElements }).map(this.standardInputFormatter)

    this.subscriptions.push(Observable.merge(text$, radio$, checkbox$, select$).subscribe(this.handleSubscribe))
  }
}
