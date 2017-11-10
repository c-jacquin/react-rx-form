import React from 'react'
import { Observable, Subject } from 'rxjs'

import {
    Field,
    Fields,
    FieldProp,
    FieldValue,
    FieldValueFunc,
    RxFormParams,
    RxFormProps,
    RxFormState,
    FormValues,
    FormSubmitValues
} from '../src'  

interface ReactRxForm {
    rxForm<Props> (fields: RxFormParams<Props>): (Comp: React.Component<Props & RxFormProps, any> | React.StatelessComponent<Props & RxFormProps>) => React.Component<Props, RxFormState>
}

export const reactRxForm: ReactRxForm
