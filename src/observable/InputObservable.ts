import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { FieldValue, InputEvent, FormValues, Fields } from '../types'
import { createInputObservable, createSelectObservable } from 'observable/factory'
import autobind from 'autobind-decorator'

export interface InputObservableParams<Props> {
  checkboxEvent?: string
  textEvent?: string
  radioEvent?: string
  selectEvent?: string
  initialValue?: FormValues
  fields?: Fields<Props>
  props?: Props
  selectElements?: HTMLSelectElement[]
  inputElements?: HTMLInputElement[]
}

export class InputObservable<Props> extends BehaviorSubject<FormValues> {
  static TEXT_INPUT = ['text', 'search', 'email', 'password', 'date', 'range', 'number']
  static RADIO_INPUT = ['radio']
  static CHECKBOX_INPUT = ['checkbox']

  checkboxEvent?: string
  textEvent?: string
  radioEvent?: string
  selectEvent?: string
  fields: Fields<Props>
  props: Props
  subscriptions: Subscription[] = []
  inputElements: HTMLInputElement[] = []

  constructor({
    inputElements = [],
    selectElements = [],
    fields = {},
    initialValue = {},
    checkboxEvent = 'change',
    textEvent = 'input',
    radioEvent = 'change',
    selectEvent = 'change',
  }: InputObservableParams<Props>) {
    super(initialValue)

    this.checkboxEvent = checkboxEvent
    this.textEvent = textEvent
    this.radioEvent = radioEvent
    this.selectEvent = selectEvent
    this.fields = fields

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
  reduceField(fieldName: string, value: FieldValue, type: string, dirty = true, touched = true): FormValues {
    let formattedValue

    switch (type) {
      case 'date':
        formattedValue = new Date(value as string)
        break

      case 'range':
      case 'number':
        formattedValue = parseInt(value as string, 10)
        break

      default:
        formattedValue = value
    }

    return {
      [fieldName]: {
        dirty,
        touched,
        value: formattedValue,
      },
    }
  }

  /**
   * standard input data formatter (input text, radioButton, select)
   * @param event - input or change event
   */
  @autobind
  standardInputFormatter(event: InputEvent | any): FormValues {
    return this.reduceField(event.target.name, event.target.value, event.target.type)
  }

  /**
   * formatter for the checkbox
   * @param event - change event
   */
  @autobind
  checkboxInputFormatter(event: InputEvent | any): FormValues {
    return this.reduceField(event.target.name, !!event.target.checked, event.target.type)
  }

  @autobind
  handleSubscribe(formValues: FormValues) {
    this.next({
      ...this.getValue(),
      ...formValues,
    })
  }

  @autobind
  handleError(formValue: FormValues): Observable<FormValues> {
    const inputName = Object.keys(formValue)[0]
    const field = this.fields[inputName]
    const state = this.getValue()
    const formattedState = Object.keys(this.fields).reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]: state[fieldName].value,
      }),
      {},
    )

    if (typeof field.validation === 'function') {
      return Observable.of({
        ...state,
        [inputName]: {
          ...formValue[inputName],
          error: field.validation(formValue[inputName].value, formattedState, this.props),
        },
      })
    } else if (typeof field.validation$ === 'function') {
      this.next({
        ...state,
        [inputName]: {
          ...state[inputName],
          pending: true,
        },
      })

      return field
        .validation$(formValue[inputName].value, formattedState, this.props)
        .map(error => ({
          ...state,
          [inputName]: {
            ...formValue[inputName],
            error,
          },
        }))
        .do(() => {
          this.next({
            ...state,
            [inputName]: {
              ...state[inputName],
              pending: false,
            },
          })
        })
    } else {
      return Observable.of(formValue)
    }
  }

  @autobind
  handleTransform(formValue: FormValues): FormValues {
    const inputName = Object.keys(formValue)[0]
    const field = this.fields[inputName]
    const state = this.getValue()

    if (typeof field.transform === 'function') {
      const element = this.inputElements.find(input => input.name === inputName)
      const value = field.transform(formValue[inputName].value, state, this.props) as string

      if (element) {
        element.value = value
      }

      return {
        [inputName]: {
          ...formValue[inputName],
          value,
        },
      }
    } else {
      return formValue
    }
  }

  /**
   * add new observable inputs to the InputObservable
   * @param inputElements - the inputElement to add
   */
  addInputs(inputElements: HTMLInputElement[], selectElements: HTMLSelectElement[] = []): void {
    this.inputElements = [...this.inputElements, ...inputElements]
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

    this.subscriptions.push(
      Observable.merge(text$, radio$, checkbox$, select$)
        .switchMap(this.handleError)
        .map(this.handleTransform)
        .subscribe(this.handleSubscribe),
    )
  }
}
