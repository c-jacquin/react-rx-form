import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Subscription, Subject, Observable } from 'rxjs'

import {
    FieldValue,
    FormValues,
    DCProps,
    DCState,
    RxFormProps,
    RxFormParams,
} from './types'

export const rxForm = function<Props extends DCProps>({
    fields,
}: RxFormParams<Props>) {
    return (
        Comp:
            | React.ComponentClass<Props & RxFormProps>
            | React.StatelessComponent<Props & RxFormProps>,
    ) => {
        return class extends React.Component<Props & RxFormProps, DCState> {
            static displayName = `RxForm(${Comp.displayName})`

            state: DCState = this.initState()

            valueChange$: Subject<any> = new Subject()
            formSubmit$: Observable<any>
            inputSubscription: Subscription
            formSubmitSubscription: Subscription

            formElement: Element
            inputElements: HTMLInputElement[]

            private reduceFieldData(
                fieldName: string,
                value: FieldValue,
                dirty = true,
                touched = true,
            ): FormValues {
                return {
                    [fieldName]: {
                        dirty,
                        touched,
                        value,
                    },
                }
            }

            private getFieldError(
                value: FieldValue,
                key: string,
            ): string | undefined {
                if (fields[key].validation) {
                    return fields[key].validation(value, this.state, this.props)
                }
            }

            initState(): DCState {
                const fieldKeys = Object.keys(fields)

                const initialFormState = {
                    dirty: false,
                    formValue: {},
                    submitted: false,
                }

                return fieldKeys.reduce((state, fieldName) => {
                    const fieldMeta = fields[fieldName]
                    const fieldValue =
                        typeof fieldMeta.value === 'function'
                            ? fieldMeta.value(this.props)
                            : fieldMeta.value || ''
                    const fieldError =
                        typeof fieldMeta.validation === 'function'
                            ? this.getFieldError(fieldValue, fieldName)
                            : null
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
                },                      initialFormState)
            }

            createFormObservable() {
                return Observable.fromEvent(this.formElement, 'submit')
                    .map((event: any) => {
                        event.preventDefault()
                        return Object.keys(fields).reduce(
                            (obj, fieldName) => ({
                                ...obj,
                                [fieldName]: this.state.formValue[fieldName]
                                    .value,
                            }),
                            {},
                        )
                    })
                    .do(() => {
                        this.setState({
                            submitted: true,
                        })
                    })
            }

            createInputObservable(types: string[], eventType: string) {
                return new Subject().merge(
                    ...this.inputElements
                        .filter(element => types.includes(element.type))
                        .map(element =>
                            Observable.fromEvent(element, eventType),
                        ),
                )
            }

            setValue = (state: any) => {
                this.setState({
                    formValue: {
                        ...this.state.formValue,
                        ...state,
                    },
                })
            }

            hasError() {
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

            attachFormElement = (form: Element) => {
                this.formElement = findDOMNode(form)
            }

            componentDidMount() {
                this.inputElements = Array.from(
                    this.formElement.querySelectorAll('input'),
                )

                this.formSubmit$ = this.createFormObservable()

                const textInputs$ = this.createInputObservable(
                    ['text', 'email', 'password', 'search'],
                    'input',
                ).map((event: any) => {
                    return this.reduceFieldData(
                        event.target.name,
                        event.target.value,
                    )
                })

                const checkBox$ = this.createInputObservable(
                    ['checkbox'],
                    'change',
                ).map((event: any) => {
                    return this.reduceFieldData(
                        event.target.name,
                        !this.state.formValue[event.target.name].value,
                    )
                })

                const radioButton$ = this.createInputObservable(
                    ['radio'],
                    'change',
                ).map((event: any) => {
                    return this.reduceFieldData(
                        event.target.name,
                        event.target.value,
                    )
                })

                this.inputSubscription = textInputs$
                    .merge(checkBox$)
                    .merge(radioButton$)
                    .subscribe(inputData => {
                        const key = Object.keys(inputData)[0]
                        inputData[key].error = this.getFieldError(
                            inputData[key].value,
                            key,
                        )

                        this.setState(
                            {
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
