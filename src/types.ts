import { Observable, Subject } from 'rxjs'

export type FieldValue = string | number | boolean
export type FieldValueFunc<Props> = (props: Props) => FieldValue

export interface RxFormParams<Props> {
  fields: Fields<Props>
  changeObs?: boolean
  debounce?: number
  throttle?: number
}

export interface Fields<Props> {
  [key: string]: Field<Props>
}

export interface FieldProp {
  dirty?: boolean
  error?: string
  touched?: boolean
  value: FieldValue
}

export interface Field<Props> {
  value: FieldValue | FieldValueFunc<Props>
  validation: (value: FieldValue, state: FormValues, props: Props) => string | undefined
}

export interface RequiredProps {
  onSubmit: (formData: any) => any
}

export interface RxFormProps {
  ref?: any
  valueChange$?: Subject<FormValues>
  formSubmit$?: Observable<FormSubmitValues>
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
