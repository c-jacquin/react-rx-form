import { Fields } from '../../../types'

export enum RxFormError {
  FIELD = 'You forgot some fields definitions: ',
  INPUT = 'You forgot some name attribute on input tag: ',
}

export const validateFiledsWithInputName = (fields: Fields<any>, inputElements: HTMLInputElement[]) => {
  const fieldsNames = Object.keys(fields).filter(fieldName => {
    return !fields[fieldName].customInput
  })
  const inputNames = inputElements.map(element => element.getAttribute('name') || '')

  const missingInputNames = fieldsNames.filter(fieldName => {
    return inputNames.indexOf(fieldName) < 0
  })

  const missingFieldNames = inputNames.filter(inputName => {
    return fieldsNames.indexOf(inputName) < 0
  })

  if (missingFieldNames.length > 0) {
    throw new Error(RxFormError.FIELD + missingFieldNames.toString())
  }

  if (missingInputNames.length > 0) {
    throw new Error(RxFormError.INPUT + missingInputNames.toString())
  }
}
