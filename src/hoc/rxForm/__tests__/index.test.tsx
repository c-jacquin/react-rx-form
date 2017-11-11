import * as React from 'react'
import { mount } from 'enzyme'
import { rxForm } from '../index'

describe('rxForm HoC', () => {
  class SimpleForm extends React.Component<any, any> {
    render() {
      return (
        <form>
          <input type="text" name="test" />
        </form>
      )
    }
  }

  it('should render a form element', () => {
    const DecoratedComponent = rxForm({
      fields: {
        test: {},
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent />)

    expect(mounted.find('form')).toBeDefined()
  })

  it('should have the correct initial state', () => {
    const DecoratedComponent = rxForm({
      fields: {
        test: {},
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent />)

    expect(mounted.state().dirty).toBeFalsy()
    expect(mounted.state().submitted).toBeFalsy()
  })

  it('should call initState and getFieldError at start', () => {
    const DecoratedComponent = rxForm({
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
    const mounted = mount(<DecoratedComponent />)

    expect(initStateSpy).toHaveBeenCalled()
    expect(getFieldErrorSpy).toHaveBeenCalled()
    expect(mounted.state()).toEqual(DecoratedComponent.prototype.initState())
  })

  it('should map properly the fields to the formValue state', () => {
    const DecoratedComponent = rxForm({
      fields: {
        test: {
          validation: () => {
            return 'test error'
          },
          value: 'test',
        },
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent />)

    expect(mounted.state().formValue.test).toEqual({
      dirty: true,
      error: 'test error',
      value: 'test',
    })
  })

  it('should be dirty if value is set', () => {
    const DecoratedComponent = rxForm({
      fields: {
        test: {
          value: 'test',
        },
      },
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent />)

    expect(mounted.state().dirty).toBeTruthy()
  })
})
