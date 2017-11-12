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

    expect(mounted.state().dirty).toBeFalsy()
    expect(mounted.state().submitted).toBeFalsy()
  })

  it('should call initState and getFieldError at start', () => {
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
    const getFieldErrorSpy = jest.spyOn(DecoratedComponent.prototype, 'getFieldError')
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(initStateSpy).toHaveBeenCalled()
    expect(getFieldErrorSpy).toHaveBeenCalled()
    expect(mounted.state()).toEqual(DecoratedComponent.prototype.initState())
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

  describe('data format', () => {
    it('should properly format data', () => {
      const DecoratedComponent = rxForm<SimpleFormProps>({
        fields: {
          test: {},
        },
        valueChangeObs: true,
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)
      const instance = mounted.instance()

      expect(instance.reduceFieldData('test', 'testValue', false, true)).toEqual({
        test: {
          dirty: false,
          touched: true,
          value: 'testValue',
        },
      })
      expect(instance.reduceFieldData('test', 'otherValue')).toEqual({
        test: {
          dirty: true,
          touched: true,
          value: 'otherValue',
        },
      })
    })
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
      expect(instance.inputSubscription).toBeInstanceOf(Subscription)
      expect(instance.formSubmitSubscription).toBeInstanceOf(Subscription)
    })

    it('should unsubscribe when unmount', () => {
      const instance = mounted.instance()
      const inputUnsubscribeSpy = jest.spyOn(instance.inputSubscription, 'unsubscribe')
      const formUnsubscribeSpy = jest.spyOn(instance.formSubmitSubscription, 'unsubscribe')

      mounted.unmount()

      expect(inputUnsubscribeSpy).toHaveBeenCalled()
      expect(formUnsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('Observable', () => {
    it('should have a formSubmit$ Observable properties', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)
      const instance = mounted.instance()

      expect(instance.formSubmit$).toBeInstanceOf(Observable)
    })

    it('should have a valueChange$ Observable depending on the params', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
        valueChangeObs: true,
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)

      expect(mounted.instance().valueChange$).toBeInstanceOf(Observable)
    })
  })

  describe('custom input', () => {
    it('setValue should call setState', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
        valueChangeObs: true,
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
    let reduceFieldDataSpy: any

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
      reduceFieldDataSpy = jest.spyOn(instance, 'reduceFieldData')
    })

    it('should call reduceFieldData when checkbox change', () => {
      instance.handleCheckboxChange({ target: { name: 'test' } })
      expect(reduceFieldDataSpy).toHaveBeenCalled()
    })

    it('should call reduceFieldData when radioButton change', () => {
      instance.handleRadioButtonChange({ target: { name: 'test' } })
      expect(reduceFieldDataSpy).toHaveBeenCalled()
    })

    it('should call reduceFieldData when textInput change', () => {
      instance.handleTextInputChange({ target: { name: 'test' } })
      expect(reduceFieldDataSpy).toHaveBeenCalled()
    })

    it('should update the state when an input emit a new value', () => {
      const setStateSpy = jest.spyOn(instance, 'setState')
      instance.handleInputSubscribeSuccess({ test: { value: 'test' } })

      expect(setStateSpy).toHaveBeenCalled()
    })

    it('should set the state to submitted => true when the form observable tick', () => {
      DecoratedComponent = rxForm<SimpleFormProps>({
        fields: {
          test: {},
        },
        valueChangeObs: true,
      })(SimpleForm)
      mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)
      instance = mounted.instance()
      const setStateSpy = jest.spyOn(instance, 'setState')
      instance.handleFormSubmit({ preventDefault: jest.fn() })

      expect(setStateSpy).toHaveBeenCalledWith({ submitted: true })
    })

    it('should throw en error in the form observable when submit and a field still has error', () => {
      expect(() => {
        instance.handleFormSubmit({ preventDefault: jest.fn() })
      }).toThrowError()
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
