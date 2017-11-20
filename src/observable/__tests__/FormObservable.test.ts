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
    formObs.init(formElement)

    formObs.subscribe(data => {
      expect(handleSubmitSpy).toHaveBeenCalled()
      expect(data).toEqual({
        test: 'test',
      })
      done()
    })
    formElement.dispatchEvent(new Event('submit'))
  })

  it('should call the onError callback when form observable submit and a field still has error', () => {
    const formValues = {
      test: {
        error: 'error !!!',
        value: 'test',
      },
    }

    const onError = (error: any) => {}

    const input$ = new BehaviorSubject(formValues)
    const formObs = new FormObservable(input$, onError)
    const formElement = document.createElement('form')
    const onErrorSpy = jest.spyOn(formObs, 'onError')

    formObs.init(formElement)

    formElement.dispatchEvent(new Event('submit'))
    expect(onErrorSpy).toHaveBeenCalledWith({
      test: 'error !!!',
    })
  })
})
