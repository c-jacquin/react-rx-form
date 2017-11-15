import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { FieldValue, InputEvent, FormValues } from '../../../types'
import autobind from 'autobind-decorator'

export interface InputObservableParams {
  checkboxEvent?: string
  textEvent?: string
  radioEvent?: string
  selectEvent?: string
  initialValue?: FormValues
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
  subscription: Subscription

  constructor(
    {
      inputElements,
      initialValue = {},
      checkboxEvent = 'change',
      textEvent = 'input',
      radioEvent = 'change',
      selectEvent = 'change',
    }: InputObservableParams = {},
  ) {
    super(initialValue)

    this.checkboxEvent = checkboxEvent
    this.textEvent = textEvent
    this.radioEvent = radioEvent
    this.selectEvent = selectEvent

    if (inputElements) {
      this.addInputs(inputElements)
    }
  }

  unsubscribe() {
    super.unsubscribe()
    this.subscription.unsubscribe()
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

  /**
   * create an Observable of the given events of the given inputs of the given types
   * @param elements - inputs elements
   * @param type - input type to filter ('checkbox, text, password ...')
   * @param event - the event to listen (change, input ...)
   */
  createInputObservable(elements: HTMLInputElement[], types: string[], event = 'change'): Observable<InputEvent | any> {
    return Observable.merge(
      ...elements
        .filter(element => types.indexOf(element.type) !== -1)
        .map(element => Observable.fromEvent(element, event)),
    )
  }

  /**
   * add new observable inputs to the InputObservable
   * @param inputElements - the inputElement to add
   */
  addInputs(inputElements: HTMLInputElement[]) {
    const text$ = this.createInputObservable(inputElements, InputObservable.TEXT_INPUT, this.textEvent).map(
      this.standardInputFormatter,
    )
    const radio$ = this.createInputObservable(inputElements, InputObservable.RADIO_INPUT, this.radioEvent).map(
      this.standardInputFormatter,
    )
    const checkbox$ = this.createInputObservable(inputElements, InputObservable.CHECKBOX_INPUT, this.checkboxEvent).map(
      this.checkboxInputFormatter,
    )

    this.subscription = Observable.merge(text$, radio$, checkbox$).subscribe(this.next.bind(this))
  }
}
