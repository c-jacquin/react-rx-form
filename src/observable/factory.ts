import { Observable } from 'rxjs'
import { ObsFactory, InputObsParams, SelectObsParams } from '../types'

/**
 * create an Observable of the given events of the given input elements of the given types
 * @param param
 * @param param.elements - inputs elements
 * @param param.type - input type to filter ('checkbox, text, password ...')
 * @param param.event - the event to listen (change, input ...)
 */
export const createInputObservable: ObsFactory<InputObsParams> = ({ elements, types, event = 'change' }) => {
  return Observable.merge(
    ...elements
      .filter(element => types.indexOf(element.type) !== -1)
      .map(element => Observable.fromEvent(element, event)),
  )
}

/**
 * create an Observable of the given events of the given select elements
 * @param param
 * @param param.elements - select elements
 * @param param.event - the event to listen (change ...)
 */
export const createSelectObservable: ObsFactory<SelectObsParams> = ({ elements, event = 'change' }) => {
  return Observable.merge(...elements.map(element => Observable.fromEvent(element, event)))
}
