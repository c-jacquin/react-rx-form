import { BehaviorSubject } from 'rxjs'
import { FormObservable } from '../FormObservable'

describe('FormObservable class', () => {
  it('should set the state to submitted => true when the form is submitted', done => {
    const formValues = {
      test: {
        value: 'test',
      },
    }
    const input$ = new BehaviorSubject(formValues)
    const formObs = new FormObservable(input$)
    const handleSubmitSpy = jest.spyOn(FormObservable.prototype, 'handleFormSubmit')
    const formElement = document.createElement('form')
    formObs.init(formElement).subscribe(data => {
      expect(handleSubmitSpy).toHaveBeenCalled()
      expect(data).toEqual({
        test: 'test',
      })
      done()
    })
    formElement.dispatchEvent(new Event('submit'))
  })

  it('should throw en error in the form observable when submit and a field still has error', done => {
    const formValues = {
      test: {
        error: 'error !!!',
        value: 'test',
      },
    }
    const input$ = new BehaviorSubject(formValues)
    const formObs = new FormObservable(input$)
    const formElement = document.createElement('form')

    formObs.init(formElement).subscribe(jest.fn(), data => {
      expect(data).toEqual({
        test: 'error !!!',
      })
      done()
    })
    formElement.dispatchEvent(new Event('submit'))
  })
})
