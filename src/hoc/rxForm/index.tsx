import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Subscription, Subject, Observable } from 'rxjs'

import {
  FieldValue,
  FormValues,
  FormSubmitValues,
  RequiredProps,
  RxFormState,
  RxFormProps,
  RxFormParams,
} from '../../types'

export const rxForm = function<Props extends RequiredProps>({ fields }: RxFormParams<Props>) {
  return (Comp: React.ComponentClass<Props & RxFormProps> | React.StatelessComponent<Props & RxFormProps>) => {
    return class extends React.Component<Props, RxFormState> {
      static displayName = `RxForm(${Comp.displayName})`

      state: RxFormState = this.initState()

      valueChange$ = new Subject<FormValues>()
      formSubmit$: Observable<FormSubmitValues>
      inputSubscription: Subscription
      formSubmitSubscription: Subscription

      formElement: Element
      inputElements: HTMLInputElement[]

      reduceFieldData(fieldName: string, value: FieldValue, dirty = true, touched = true): FormValues {
        return {
          [fieldName]: {
            dirty,
            touched,
            value,
          },
        }
      }

      getFieldError(value: FieldValue, key: string): string | undefined {
        const initEmptyFormValue = () => {
          return Object.keys(fields).reduce(
            (acc, fieldName) => ({
              ...acc,
              [fieldName]: {},
            }),
            {},
          )
        }

        if (fields[key].validation) {
          return fields[key].validation(value, this.state ? this.state.formValue : initEmptyFormValue(), this.props)
        }
      }

      initState(): RxFormState {
        const fieldKeys = Object.keys(fields)

        const initialFormState = {
          dirty: false,
          formValue: {},
          submitted: false,
        }

        return fieldKeys.reduce((state, fieldName) => {
          const fieldMeta = fields[fieldName]
          const fieldValue = typeof fieldMeta.value === 'function' ? fieldMeta.value(this.props) : fieldMeta.value || ''
          const fieldError =
            typeof fieldMeta.validation === 'function' ? this.getFieldError(fieldValue, fieldName) : null
          const dirty = !!fieldValue

          return {
            ...state,
            dirty,
            formValue: {
              ...state.formValue,
              [fieldName]: {
                dirty,
                error: fieldError,
                value: fieldValue,
              },
            },
          }
        }, initialFormState)
      }

      createFormObservable(): Observable<FormSubmitValues> {
        return Observable.fromEvent(this.formElement, 'submit').map((event: any) => {
          event.preventDefault()
          return Object.keys(fields).reduce(
            (obj, fieldName) => ({
              ...obj,
              [fieldName]: this.state.formValue[fieldName].value,
            }),
            {},
          )
        })
      }

      createInputObservable(types: string[], eventType: string): Observable<any> {
        return new Subject().merge(
          ...this.inputElements
            .filter(element => types.includes(element.type))
            .map(element => Observable.fromEvent(element, eventType)),
        )
      }

      hasError(): boolean {
        let hasError = false
        Object.keys(fields).some(fieldName => {
          if (this.state.formValue[fieldName].error) {
            hasError = true
            return true
          }
          return false
        })
        return hasError
      }

      setValue = (state: any) => {
        this.setState({
          formValue: {
            ...this.state.formValue,
            ...state,
          },
        })
      }

      attachFormElement = (form: Element) => {
        this.formElement = findDOMNode(form)
      }

      setInitialInputValues() {
        Object.keys(fields).forEach(inputName => {
          const inputElement = this.inputElements.find(element => element.getAttribute('name') === inputName)
          if (inputElement) {
            inputElement.value = this.state.formValue[inputName].value.toString()
          }
        })
      }

      componentDidMount() {
        this.inputElements = Array.from(this.formElement.querySelectorAll('input')).filter(element =>
          element.hasAttribute('name'),
        )

        this.setInitialInputValues()

        this.formSubmit$ = this.createFormObservable()

        const textInputs$ = this.createInputObservable(
          ['text', 'email', 'password', 'search'],
          'input',
        ).map((event: any) => {
          return this.reduceFieldData(event.target.name, event.target.value)
        })

        const checkBox$ = this.createInputObservable(['checkbox'], 'change').map((event: any) => {
          return this.reduceFieldData(event.target.name, !this.state.formValue[event.target.name].value)
        })

        const radioButton$ = this.createInputObservable(['radio'], 'change').map((event: any) => {
          return this.reduceFieldData(event.target.name, event.target.value)
        })

        this.inputSubscription = textInputs$
          .merge(checkBox$)
          .merge(radioButton$)
          .subscribe(inputData => {
            const inputName = Object.keys(inputData)[0]

            inputData[inputName].error = this.getFieldError(inputData[inputName].value, inputName)

            this.setState(
              {
                dirty: true,
                formValue: {
                  ...this.state.formValue,
                  ...inputData,
                },
              },
              () => this.valueChange$.next(this.state.formValue),
            )
          })

        this.formSubmitSubscription = this.formSubmit$
          .filter(() => !this.hasError())
          .do(() => {
            this.setState({
              submitted: true,
            })
          })
          .subscribe(state => this.props.onSubmit(state))
      }

      componentWillUnmount() {
        this.formSubmitSubscription.unsubscribe()
        this.inputSubscription.unsubscribe()
      }

      render() {
        return (
          <Comp
            ref={this.attachFormElement}
            valueChange$={this.valueChange$}
            formSubmit$={this.formSubmit$}
            setValue={this.setValue}
            valid={!this.hasError()}
            submitted={this.state.submitted}
            {...this.state.formValue}
            {...this.props}
          />
        )
      }
    }
  }
}
