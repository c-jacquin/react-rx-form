import { Observable } from 'rxjs'
import { createInputObservable } from '../factory'

describe('observable factory', () => {
  it('createInputObservable', () => {
    const elements = new Array(4).map(() => {
      const element = document.createElement('input')
      element.type = 'text'
      return element
    })
    expect(createInputObservable({ elements, types: ['text'] })).toBeInstanceOf(Observable)
  })
})
