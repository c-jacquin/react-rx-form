/* tslint:disable:max-classes-per-file */

import * as React from 'react'
import { Observable, Subscription } from 'rxjs'
import { mount } from 'enzyme'
import { rxForm } from '../index'
import { RxFormError } from '../utils/validation'

describe('rxForm HoC', () => {
  interface SimpleFormProps {
    foo?: string
    onSubmit: () => void
    onError?: () => void
  }
  class SimpleForm extends React.Component<SimpleFormProps, any> {
    render() {
      return (
        <form>
          <input type="text" name="test" />
        </form>
      )
    }
  }

  const onSubmit = () => {}

  it('should render a form element', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      fields: {
        test: {},
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(mounted.find('form')).toBeDefined()
  })

  it('should have the correct initial state', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      fields: {
        test: {},
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(mounted.state().dirty).toEqual(DecoratedComponent.prototype.initState().dirty)
    expect(mounted.state().submitted).toBeFalsy()
    expect(mounted.state().formValue).toEqual(DecoratedComponent.prototype.initState().formValue)
  })

  it('should call initFormValue at start', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      fields: {
        test: {
          validation: () => {
            return 'test error'
          },
          value: 'test',
        },
      },
    })(SimpleForm)
    const initStateSpy = jest.spyOn(DecoratedComponent.prototype, 'initState')
    mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(initStateSpy).toHaveBeenCalled()
  })

  it('should map properly the fields to the formValue state', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      fields: {
        test: {
          validation: () => {
            return 'test error'
          },
          value: ({ foo }) => {
            return foo + ' added info'
          },
        },
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} foo={'bar'} />)

    expect(mounted.state().formValue.test).toEqual({
      dirty: true,
      error: 'test error',
      value: 'bar added info',
    })
  })

  it('should be dirty if value is set', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      fields: {
        test: {
          value: 'test',
        },
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(mounted.state().dirty).toBeTruthy()
  })

  describe('input and form subscription', () => {
    let DecoratedComponent
    let mounted: any

    beforeEach(() => {
      DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
      })(SimpleForm)
      mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)
    })

    it('should be defined', () => {
      const instance = mounted.instance()
      expect(instance.valueChangeSubscription).toBeInstanceOf(Subscription)
      expect(instance.formSubmitSubscription).toBeInstanceOf(Subscription)
    })

    it('should unsubscribe when unmount', () => {
      const instance = mounted.instance()
      const valueChangeUnsubscribeSpy = jest.spyOn(instance.valueChangeSubscription, 'unsubscribe')
      const formUnsubscribeSpy = jest.spyOn(instance.formSubmitSubscription, 'unsubscribe')

      mounted.unmount()

      expect(valueChangeUnsubscribeSpy).toHaveBeenCalled()
      expect(formUnsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('Observable', () => {
    it('should have a valueChange$ and a formSubmit$ Observable', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
        valueChangeObs: true,
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)

      expect(mounted.instance().valueChange$).toBeInstanceOf(Observable)
      expect(mounted.instance().formSubmit$).toBeInstanceOf(Observable)
    })
  })

  describe('custom input', () => {
    it('setValue should call setState', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)
      const instance = mounted.instance()
      const setStateSpy = jest.spyOn(instance, 'setState')

      instance.setValue({
        test: {
          value: 'tototo',
        },
      })
      expect(setStateSpy).toHaveBeenCalled()
    })
  })

  describe('input and form handlers', () => {
    let DecoratedComponent
    let mounted
    let instance: any

    beforeEach(() => {
      DecoratedComponent = rxForm<SimpleFormProps>({
        fields: {
          test: {
            validation: () => {
              return 'test error'
            },
          },
        },
        valueChangeObs: true,
      })(SimpleForm)
      mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)
      instance = mounted.instance()
    })

    it('should update the state when an input emit a new value', () => {
      const setStateSpy = jest.spyOn(instance, 'setState')
      instance.handleValueChangeSuccess({ test: { value: 'test' } })

      expect(setStateSpy).toHaveBeenCalled()
    })
  })

  describe('Error', () => {
    beforeEach(() => {
      console.error = jest.fn()
    })

    it('should throw an error if fields key didnt match the inputs name attribute', () => {
      expect(() => {
        class BadForm extends React.Component<any, any> {
          componentDidCatch() {}
          render() {
            return (
              <form>
                <input />
              </form>
            )
          }
        }
        const DecoratedComponent = rxForm<any>({
          fields: { test: {} },
        })(BadForm)
        mount(<DecoratedComponent />)
      }).toThrow(RxFormError.INPUT + 'test')
    })

    it('should throw an error if fields key didnt match the inputs name attribute', () => {
      expect(() => {
        const DecoratedComponent = rxForm<SimpleFormProps>({
          fields: {},
        })(SimpleForm)
        mount(<DecoratedComponent onSubmit={onSubmit} />)
      }).toThrow(RxFormError.FIELD + 'test')
    })
  })
})
