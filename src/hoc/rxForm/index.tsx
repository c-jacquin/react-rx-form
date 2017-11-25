import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Subscription } from 'rxjs'
import autobind from 'autobind-decorator'

import { FormValues, RequiredProps, RxFormState, RxFormProps, RxFormParams } from 'types'
import { validateFiledsWithInputName, RxFormError } from './utils/validation'
import { InputObservable } from 'observable/InputObservable'
import { FormObservable } from 'observable/FormObservable'

const initialState = {
  dirty: false,
  formValue: {},
  submitted: false,
}

/**
 * Decorate a react componnent with a form tag as root
 * @param param configuration object of the hoc
 * @param param.fields Object representing the input of the form (value, validation ...), each key must correspond with the
 * name attribute of an input element
 * @param [param.debounce = 300] debounce in ms
 * @param [param.throttle] throttle in ms
 * @returns a function wich take a react component as arg and return a react component
 */
export const rxForm = function<Props extends RequiredProps>({
  fields,
  valueChangeObs,
  debounce = 300,
  throttle = 0,
}: RxFormParams<Props>) {
  return (Comp: React.ComponentClass<Props & RxFormProps> | any) => {
    /**
     * RxForm Higher order component
     */
    class RxForm extends React.Component<Props, RxFormState> {
      static displayName = `RxForm(${Comp.displayName || Comp.name})`

      static defaultProps = {
        onError: () => {},
      }

      state: RxFormState = this.initState()

      valueChange$ = new InputObservable({
        fields,
        initialValue: this.state.formValue,
      })
      formSubmit$ = new FormObservable(this.valueChange$, this.props.onError)

      valueChangeSubscription = new Subscription()
      formSubmitSubscription = new Subscription()

      formElement: HTMLFormElement
      inputElements: HTMLInputElement[]
      selectElements: HTMLSelectElement[]

      /**
       * bind the root element of the decorated component to the class (must be a form tag)
       * handler for the ref attribute of the decorated component
       * @param form
       */
      @autobind
      attachFormElement(instance: React.Component<Props & RxFormProps>): void {
        this.formElement = findDOMNode(instance) as HTMLFormElement
      }

      /**
       * used to validate the inputs during the first render
       * @see initState
       */
      initSimplifiedFormValue(): FormValues {
        return Object.keys(fields).reduce((acc, fieldName) => {
          const fieldMeta = fields[fieldName]
          return {
            ...acc,
            [fieldName]: typeof fieldMeta.value === 'function' ? fieldMeta.value(this.props) : fieldMeta.value || '',
          }
        }, {})
      }

      /**
       * parse the fields param and set the initial formValue, also determine if the form is dirty
       */
      initState(): RxFormState {
        return Object.keys(fields).reduce((state, fieldName) => {
          const fieldMeta = fields[fieldName]
          const fieldValue = typeof fieldMeta.value === 'function' ? fieldMeta.value(this.props) : fieldMeta.value || ''
          const dirty = fieldValue !== ''
          let fieldError

          if (fieldMeta.validation) {
            fieldError = fieldMeta.validation(fieldValue, this.initSimplifiedFormValue(), this.props)
          }

          return {
            ...state,
            dirty: state.dirty || dirty,
            formValue: {
              ...state.formValue,
              [fieldName]: {
                dirty,
                error: fieldError,
                value: fieldValue,
              },
            },
          }
        }, initialState)
      }

      /**
       * set the initial value of input tag if specified in the config
       */
      setInitialInputValues(): void {
        Object.keys(fields).forEach(inputName => {
          const inputElements = this.inputElements.filter(element => element.getAttribute('name') === inputName)
          const selectElements = this.selectElements.filter(element => element.getAttribute('name') === inputName)
          const fieldValue = this.state.formValue[inputName].value

          if (inputElements[0] && fieldValue) {
            switch (inputElements[0].getAttribute('type')) {
              case 'checkbox':
                if (typeof fieldValue === 'boolean') {
                  inputElements[0].checked = !!fieldValue
                } else {
                  throw new Error(`${inputName} ${RxFormError.TYPE} boolean`)
                }
                break

              case 'radio':
                if (typeof fieldValue === 'string') {
                  inputElements.some(element => {
                    if (element.getAttribute('value') === fieldValue) {
                      element.checked = true
                      return true
                    }
                    return false
                  })
                } else {
                  throw new Error(`${inputName} ${RxFormError.TYPE} string`)
                }
                break

              case 'date':
                if (fieldValue instanceof Date) {
                  inputElements[0].value = new Date(fieldValue.toString()).toISOString().substr(0, 10)
                } else {
                  throw new Error(`${inputName} ${RxFormError.TYPE} Date`)
                }
                break

              case 'range':
              case 'number':
                if (typeof fieldValue === 'number') {
                  inputElements[0].value = fieldValue.toString()
                } else {
                  throw new Error(`${inputName} ${RxFormError.TYPE} number`)
                }
                break

              default:
                if (typeof fieldValue === 'string') {
                  inputElements[0].value = fieldValue.toString()
                } else {
                  throw new Error(`${inputName} ${RxFormError.TYPE} string`)
                }
                break
            }
          }

          if (selectElements[0] && fieldValue) {
            if (typeof fieldValue === 'string') {
              Array.from(selectElements[0].querySelectorAll('option')).forEach(optionElement => {
                optionElement.selected = optionElement.value === fieldValue
              })
            } else {
              throw new Error(`${inputName} ${RxFormError.TYPE} string`)
            }
          }
        })
      }

      /**
       * Check if the form has error
       */
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

      /**
       * Usefull to update the form state without trigering dom event, (custom component)
       * @param {state} - the data to add to the state { [fieldName]: fieldValue }
       * @returns {void}
       */
      @autobind
      setValue(state: any): void {
        this.setState({
          formValue: {
            ...this.state.formValue,
            ...state,
          },
        })
      }

      /**
       * update the state of the form each time an input change and tick the valueChange$ Observable
       * @param formValue the state of the form
       */
      @autobind
      handleValueChangeSuccess(formValue: FormValues): void {
        this.setState({
          dirty: true,
          formValue,
        })
      }

      /**
       * handler for the filter of the inputs array, check if the input has a name property
       * @param element - input or select element
       */
      handleFilterInputs(element: Element): boolean {
        return element.hasAttribute('name')
      }

      componentDidMount() {
        this.inputElements = Array.from(this.formElement.querySelectorAll('input')).filter(this.handleFilterInputs)
        this.selectElements = Array.from(this.formElement.querySelectorAll('select')).filter(this.handleFilterInputs)

        validateFiledsWithInputName(fields, [...this.inputElements, ...this.selectElements])

        this.setInitialInputValues()

        this.valueChange$.addInputs(this.inputElements, this.selectElements)
        this.formSubmit$.init(this.formElement)

        this.valueChangeSubscription = this.valueChange$
          .debounceTime(debounce)
          .throttleTime(throttle)
          .subscribe(this.handleValueChangeSuccess)

        this.formSubmitSubscription = this.formSubmit$
          .do(() => this.setState({ submitted: true }))
          .subscribe(this.props.onSubmit)
      }

      componentWillUnmount() {
        this.formSubmitSubscription.unsubscribe()
        this.valueChangeSubscription.unsubscribe()
        this.valueChange$.unsubscribe()
      }

      render() {
        return (
          <Comp
            ref={this.attachFormElement}
            formSubmit$={this.formSubmit$}
            valueChange$={valueChangeObs ? this.valueChange$ : null}
            setValue={this.setValue}
            valid={!this.hasError()}
            submitted={this.state.submitted}
            {...this.state.formValue}
            {...this.props}
          />
        )
      }
    }

    return RxForm
  }
}
