import { Subject, BehaviorSubject } from 'rxjs'
import { FormSubmitValues, FormValues, FormErrors } from '../types'
import autobind from 'autobind-decorator'
import { createFormObservable } from 'observable/factory'

export class FormObservable extends Subject<FormSubmitValues> {
  static EVENT = 'submit'

  input$: BehaviorSubject<FormValues>
  onError: (error: FormErrors) => any
  hasError: boolean

  constructor(input$: BehaviorSubject<FormValues>, onError = (error: FormErrors) => {}, formElement?: HTMLFormElement) {
    super()

    this.input$ = input$
    this.onError = onError
    this.hasError = false

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
    const inputValues = this.input$.getValue()
    this.hasError = false

    const formValue = Object.keys(inputValues).reduce((obj, fieldName) => {
      if (inputValues[fieldName].error) {
        this.hasError = true

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

    if (this.hasError) {
      this.onError(errorObject)
    }

    return formValue
  }

  init(element: HTMLFormElement) {
    return createFormObservable({ element, event: FormObservable.EVENT })
      .map(this.handleFormSubmit)
      .filter(() => !this.hasError)
      .subscribe(this.next.bind(this))
  }
}
