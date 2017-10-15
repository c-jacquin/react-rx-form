type fieldValue = string | number | boolean
type fieldValueFunc<Props> = (props:Props) => fieldValue

export interface FieldProp {
    dirty: boolean
    error: string
    touched: boolean
    value: fieldValue
}

export interface Field<Props> {
    value: fieldValue | fieldValueFunc<Props>
    validation: (value: fieldValue) => string
}