import { fromEvent } from 'rxjs/observable/fromEvent'
import { merge } from 'rxjs/observable/merge'

import { ObsFactory, InputObsParams, SelectObsParams, FormObsParams } from '../types'

/**
 * create an Observable of the given events of the given input elements of the given types
 * @param param
 * @param param.elements - inputs elements
 * @param param.type - input type to filter ('checkbox, text, password ...')
 * @param param.event - the event to listen (change, input ...)
 */
export const createInputObservable: ObsFactory<InputObsParams> = ({ elements, types, event = 'change' }) => {
  return merge(
    ...elements.filter(element => types.indexOf(element.type) !== -1).map(element => fromEvent(element, event)),
  )
}

/**
 * create an Observable of the given events of the given select elements
 * @param param
 * @param param.elements - select elements
 * @param param.event - the event to listen (change ...)
 */
export const createSelectObservable: ObsFactory<SelectObsParams> = ({ elements, event = 'change' }) => {
  return merge(...elements.map(element => fromEvent(element, event)))
}

/**
 * Create an Observable of the given form (by default listen submit event)
 * @param param
 * @param param.element - form element
 * @param param.event - the event to listen (submit ...)
 */
export const createFormObservable: ObsFactory<FormObsParams> = ({ element, event = 'submit' }) => {
  return fromEvent(element, event)
}
