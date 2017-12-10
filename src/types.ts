import { Observable } from 'rxjs/Observable'

export type FieldValue = string | number | boolean | Date
export type FieldValueFunc<Props> = (props: Props) => FieldValue

export interface RxFormParams<Props> {
  fields: Fields<Props>
  valueChangeObs?: boolean
  debounce?: number
  throttle?: number
  transform?: (formValue: FormSubmitValues, props: Props) => FormSubmitValues
}

export interface Fields<Props> {
  [key: string]: Field<Props>
}

export interface FieldProp {
  dirty?: boolean
  error?: string
  touched?: boolean
  pending?: boolean
  value: FieldValue
}

export interface Field<Props> {
  value?: FieldValue | FieldValueFunc<Props>
  validation?: (value: FieldValue, state: FormValues, props: Props) => string | undefined
  validation$?: (value: FieldValue, state: FormValues, props: Props) => Observable<string | undefined>
  transform?: (value: FieldValue, state: FormValues, props: Props) => FieldValue
  customInput?: boolean
  optional?: boolean
}

export interface RequiredProps {
  onSubmit: (formValues: FormSubmitValues) => any
  onError?: (error: FormErrors) => any
}

export interface RxFormProps {
  valueChange$?: Observable<FormValues> | null
  formSubmit$?: Observable<FormSubmitValues> | null
  setValue?: (state: any) => void
  valid?: boolean
  submitted?: boolean
}

export interface RxFormState {
  formValue: FormValues
  dirty: boolean
  submitted: boolean
}

export interface FormValues {
  [key: string]: FieldProp
}

export interface FormSubmitValues {
  [key: string]: FieldValue
}

export interface FormErrors {
  [key: string]: string
}

// Event

export interface InputEventTarget {
  name: string
  value: FieldValue
  checked?: boolean
}

export interface InputEvent {
  target: InputEventTarget
}

export interface SelectObsParams {
  elements: HTMLSelectElement[]
  event?: string
}

export interface InputObsParams {
  elements: HTMLInputElement[]
  types: string[]
  event?: string
}

export interface FormObsParams {
  element: HTMLFormElement
  event: string
}

export type ObsFactory<P> = (params: P) => Observable<InputEvent | any>

// Wizard

type StepsFunction<Props> = (props: Props) => Array<React.ComponentClass<any> | React.StatelessComponent<any>>

export interface WizardParams<Props> {
  initialStep?: number
  submitStep?: number
  steps: (Array<React.ComponentClass<any> | React.StatelessComponent<any>>) | StepsFunction<Props>
}

export interface WizardState {
  currentStep: number
  formExtraProps: any
  formValue: FormValues
  submitted: boolean
  totalSteps: number
}

export interface WizardProps extends WizardState, RequiredProps {
  goTo: (step: number) => void
  renderCurrentForm: () => JSX.Element
}
