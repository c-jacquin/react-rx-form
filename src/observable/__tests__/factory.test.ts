import { Observable } from 'rxjs'
import { createInputObservable, createSelectObservable } from '../factory'

describe('observable factory', () => {
  it('createInputObservable should return an Observable', () => {
    const elements = new Array(4).map(() => {
      const element = document.createElement('input')
      element.type = 'text'
      return element
    })
    expect(createInputObservable({ elements, types: ['text'] })).toBeInstanceOf(Observable)
  })

  it('createSelectObservable should return an Observable', () => {
    const elements = new Array(4).map(() => {
      const element = document.createElement('select')
      return element
    })
    expect(createSelectObservable({ elements })).toBeInstanceOf(Observable)
  })
})
