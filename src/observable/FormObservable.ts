import { Subject, Observable, BehaviorSubject } from 'rxjs'
import { FormSubmitValues, FormValues } from '../types'
import autobind from 'autobind-decorator'

export class FormObservable extends Subject<FormSubmitValues> {
  static EVENT = 'submit'

  input$: BehaviorSubject<FormValues>

  constructor(input$: BehaviorSubject<FormValues>, formElement?: HTMLFormElement) {
    super()

    this.input$ = input$

    if (formElement) {
      this.init(formElement)
    }
  }

  /**
   * form submit handler format the data, throw an error if a field is not valid
   * @param event - form submit event
   */
  @autobind
  handleFormSubmit(event: Event) {
    event.preventDefault()
    let errorObject = {}
    let hasError = false
    const inputValues = this.input$.getValue()

    const formValue = Object.keys(inputValues).reduce((obj, fieldName) => {
      if (inputValues[fieldName].error) {
        hasError = true
        errorObject = {
          ...errorObject,
          [fieldName]: inputValues[fieldName].error,
        }
      }

      return {
        ...obj,
        [fieldName]: inputValues[fieldName].value,
      }
    }, {})

    if (hasError) {
      throw errorObject
    }

    return formValue
  }

  init(formElement: HTMLFormElement) {
    return this.merge(Observable.fromEvent(formElement, FormObservable.EVENT)).map(this.handleFormSubmit)
  }
}
