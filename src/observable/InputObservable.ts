import { BehaviorSubject, forkJoin, merge, Observable, of, Subscription } from 'rxjs'
import { tap, map, switchMap } from 'rxjs/operators'
import autobind from 'autobind-decorator'

import { FieldValue, InputEvent, FormValues, Fields } from '../types'
import { createInputObservable, createSelectObservable } from './factory'

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
    props,
  }: InputObservableParams<Props>) {
    super(initialValue)

    this.checkboxEvent = checkboxEvent
    this.textEvent = textEvent
    this.radioEvent = radioEvent
    this.selectEvent = selectEvent
    this.fields = fields
    this.props = props as Props

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

  formatState(state: FormValues) {
    /* tslint:disable */
    console.log('RX format state', state, Object.keys(this.fields))
    return Object.keys(this.fields).reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]: state[fieldName].value,
      }),
      {},
    )
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

  @autobind
  setValue(formValue: FormValues): void {
    of(this.handleBeforeValidation(formValue))
      .pipe(switchMap(this.handleError))
      .toPromise()
      .then(state => {
        this.next({
          ...this.getValue(),
          ...state,
        })
      })
  }

  @autobind
  setValues(formValue: FormValues): void {
    forkJoin(
      Object.keys(formValue)
        .map(key => this.handleBeforeValidation({ [key]: formValue[key] }))
        .map(this.handleError),
    )
      .pipe(map(values => values.reduce((acc, value) => ({ ...acc, ...value }), {})))
      .toPromise()
      .then(this.next.bind(this))
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

    if (typeof field.validation === 'function') {
      return of({
        ...state,
        [inputName]: {
          ...formValue[inputName],
          error: field.validation(formValue[inputName].value, this.formatState(state), this.props),
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

      return field.validation$(formValue[inputName].value, this.formatState(state), this.props).pipe(
        map(error => ({
          ...state,
          [inputName]: {
            ...formValue[inputName],
            error,
          },
        })),
        tap(() => {
          this.next({
            ...state,
            [inputName]: {
              ...state[inputName],
              pending: false,
            },
          })
        }),
      )
    } else {
      return of(formValue)
    }
  }

  @autobind
  handleBeforeValidation(formValue: FormValues): FormValues {
    const inputName = Object.keys(formValue)[0]
    const field = this.fields[inputName]
    const state = this.getValue()

    if (typeof field.beforeValidation === 'function') {
      const element = this.inputElements.find(input => input.name === inputName)
      const value = field.beforeValidation(formValue[inputName].value, this.formatState(state), this.props)

      if (element && typeof value === 'string') {
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

  @autobind
  handleAfterValidation(formValue: FormValues): FormValues {
    const inputName = Object.keys(formValue)[0]
    const field = this.fields[inputName]
    const state = this.getValue()

    if (typeof field.afterValidation === 'function') {
      const value = field.afterValidation(formValue[inputName].value, this.formatState(state), this.props)

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
    }).pipe(map(this.standardInputFormatter))

    const radio$ = createInputObservable({
      elements: inputElements,
      event: this.radioEvent,
      types: InputObservable.RADIO_INPUT,
    }).pipe(map(this.standardInputFormatter))

    const checkbox$ = createInputObservable({
      elements: inputElements,
      event: this.checkboxEvent,
      types: InputObservable.CHECKBOX_INPUT,
    }).pipe(map(this.checkboxInputFormatter))

    const select$ = createSelectObservable({ elements: selectElements }).pipe(map(this.standardInputFormatter))

    this.subscriptions.push(
      merge(text$, radio$, checkbox$, select$)
        .pipe(map(this.handleBeforeValidation), switchMap(this.handleError), map(this.handleAfterValidation))
        .subscribe(this.handleSubscribe),
    )
  }
}
