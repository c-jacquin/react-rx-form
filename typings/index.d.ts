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
    WizardParams,
    WizardProps,
    WizardState,
    FormValues,
    FormSubmitValues
} from '../src/types'

interface RxForm {
    rxForm<Props> (params: RxFormParams<Props>): (Comp: React.Component<Props & RxFormProps, any>) => React.Component<Props, RxFormState>
}

interface WizardForm {
    Wizard<Props> (params: WizardParams): (Comp: React.Component<Props & WizardProps & WizardState, any>) => React.Component<Props, WizardState>
}

export * from '../src/types'
export const rxForm: RxForm
export const wizard: WizardForm