import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Subscription } from 'rxjs'
import autobind from 'autobind-decorator'

import { FieldValue, FormValues, RequiredProps, RxFormState, RxFormProps, RxFormParams } from 'types'
import { validateFiledsWithInputName } from './utils/validation'
import { InputObservable } from './utils/InputObservable'
import { FormObservable } from './utils/FormObservable'

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
  return (Comp: React.ComponentClass<Props & RxFormProps> | React.StatelessComponent<Props & RxFormProps>) => {
    /**
     * RxForm Higher order component
     */
    class RxForm extends React.Component<Props, RxFormState> {
      static displayName = `RxForm(${Comp.displayName || Comp.name})`

      static defaultProps = {
        onError: () => {},
      }

      state: RxFormState = this.initState()
      /**
       * An rxjs Observable, tick each time the form state change
       */
      valueChange$ = new InputObservable(this.state.formValue)
      /**
       * An rxjs Observable, tick if the form is submitted, emit an error if validation fails
       */
      formSubmit$ = new FormObservable(this.valueChange$)
      /**
       * the subscription of the valueChange$ Observable
       */
      valueChangeSubscription = new Subscription()
      formSubmitSubscription = new Subscription()

      /**
       * The Root element of the decorated component (for now must be a form tag)
       */
      formElement: HTMLFormElement
      /**
       * An array of the inputs tag with a name attribute
       */
      inputElements: HTMLInputElement[]
      /**
       * An array of the select tags with a name attribute
       */
      selectElements: HTMLSelectElement[]

      /**
       * bind the root element of the decorated component to the class (must be a form tag)
       * handler for the ref attribute of the decorated component
       * @param form 
       */
      @autobind
      attachFormElement(form: Element) {
        this.formElement = findDOMNode(form) as HTMLFormElement
      }

      /**
       * parse the fields param and set the initial formValue, also determine if the form is dirty
       */
      initState() {
        return Object.keys(fields).reduce((state, fieldName) => {
          const fieldMeta = fields[fieldName]
          const fieldValue = typeof fieldMeta.value === 'function' ? fieldMeta.value(this.props) : fieldMeta.value || ''
          const fieldError = this.getFieldError(fieldValue, fieldName)
          const dirty = fieldValue !== ''

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
      setInitialInputValues() {
        Object.keys(fields).forEach(inputName => {
          const inputElement = this.inputElements.find(element => element.getAttribute('name') === inputName)
          if (inputElement) {
            inputElement.value = this.state.formValue[inputName].value.toString()
          }
        })
      }

      /**
       * Determine if a field has an error and return it
       * @param value the value of the input
       * @param key the name of the input
       */
      getFieldError(value: FieldValue, key: string): string | undefined {
        /**
         * if the state is not defined yet, we build a fake one for the validation functions
         */
        const initEmptyFormValue = () => {
          return Object.keys(fields).reduce(
            (acc, fieldName) => ({
              ...acc,
              [fieldName]: {},
            }),
            {},
          )
        }

        const field = fields[key]

        if (field.validation) {
          return field.validation(value, this.state ? this.state.formValue : initEmptyFormValue(), this.props)
        }
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
      setValue(state: any) {
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
      handleValueChangeSuccess(formValue: FormValues) {
        const inputName = Object.keys(formValue)[0]

        if (formValue[inputName]) {
          formValue[inputName].error = this.getFieldError(formValue[inputName].value, inputName)
        }

        this.setState(
          {
            dirty: true,
            formValue: {
              ...this.state.formValue,
              ...formValue,
            },
          },
          () => {
            if (this.valueChange$) {
              this.valueChange$.next(this.state.formValue)
            }
          },
        )
      }

      /**
       * handler for the filter of the inputs array, check if the input has a name property
       * @param element - input or select element
       */
      handleFilterInputs(element: Element) {
        return element.hasAttribute('name')
      }

      componentDidMount() {
        this.inputElements = Array.from(this.formElement.querySelectorAll('input')).filter(this.handleFilterInputs)

        validateFiledsWithInputName(fields, this.inputElements)

        this.setInitialInputValues()

        this.valueChange$.addInputs(this.inputElements)

        this.valueChangeSubscription = this.valueChange$
          .debounceTime(debounce)
          .throttleTime(throttle)
          .subscribe(this.handleValueChangeSuccess)

        this.formSubmitSubscription = this.formSubmit$
          .init(this.formElement)
          .do(() => this.setState({ submitted: true }))
          .subscribe(this.props.onSubmit, this.props.onError)
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
