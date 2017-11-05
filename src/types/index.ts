import { Observable, Subject } from 'rxjs'

export type FieldValue = string | number | boolean
export type FieldValueFunc<Props> = (props: Props) => FieldValue

export interface RxFormParams<Props> {
    fields: Fields<Props, DCState>
    changeObs?: boolean
    submitObs?: boolean
}

export interface Fields<Props, State> {
    [key: string]: Field<Props, State>
}

export interface FieldProp {
    dirty?: boolean
    error?: string
    touched?: boolean
    value: FieldValue
}

export interface Field<Props, State> {
    value: FieldValue | FieldValueFunc<Props>
    validation: (
        value: FieldValue,
        state: State,
        props: any,
    ) => string | undefined
}

export interface DCProps {
    onSubmit: (formData: any) => any
}

export interface RxFormProps {
    ref?: any
    valueChange$?: Subject<any>
    formSubmit$?: Observable<any>
    setValue?: () => void
    valid?: boolean
    submitted?: boolean
}

export interface DCState {
    formValue: FormValues
    dirty: boolean
    submitted: boolean
}

export interface FormValues {
    [key: string]: FieldProp
}
