import * as React from 'react'

import {
    Field,
    Fields,
    FieldProp,
    FieldValue,
    FieldValueFunc,
    FormValues,
    FormSubmitValues,
    RequiredProps,
    RxFormParams,
    RxFormProps,
    RxFormState,
    WizardParams,
    WizardProps,
    WizardState,
} from './src/types'

export * from './src/types'
export declare function rxForm<Props>(params: RxFormParams<Props>): (Comp: React.ComponentClass<Props & RxFormProps>) => React.ComponentClass<Props & RequiredProps>
export declare function wizard<Props>(params: WizardParams<Props>): (Comp: React.ComponentClass<Props & WizardProps>) => React.ComponentClass<Props & RequiredProps>
export declare function SimpleWizard(props: WizardProps): JSX.Element
