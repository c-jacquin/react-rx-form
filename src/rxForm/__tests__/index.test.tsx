/* tslint:disable:max-classes-per-file */

import * as React from 'react'
import { Observable, Subscription } from 'rxjs'
import { mount } from 'enzyme'
import { rxForm } from '../index'
import { RxFormError } from '../utils/validation'

describe('rxForm HoC', () => {
  let formElement: HTMLFormElement
  interface SimpleFormProps {
    foo?: string
    onSubmit: () => void
    onError?: () => void
  }
  class SimpleForm extends React.Component<SimpleFormProps, any> {
    render() {
      return (
        <form ref={c => (formElement = c as HTMLFormElement)}>
          <input type="text" name="test" />
        </form>
      )
    }
  }

  const onSubmit = () => {}

  it('should render a form element', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      debounce: 400,
      fields: {
        test: {},
      },
      throttle: 677,
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)

    expect(mounted.find('form')).toBeDefined()
  })

  it('should have a formElement property defined of type HTMLFormElement', () => {
    const DecoratedComponent = rxForm<SimpleFormProps>({
      debounce: 400,
      fields: {
        test: {},
      },
      throttle: 677,
    })(SimpleForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)
    const instance = mounted.instance() as any

    expect(instance.formElement).toBeInstanceOf(HTMLFormElement)
  })

  it('should have a formElement property defined of type HTMLFormElement even if the root tag is not a form', () => {
    class MyForm extends React.Component {
      render() {
        return (
          <div>
            <form>
              <input name="test" />
            </form>
          </div>
        )
      }
    }
    const DecoratedComponent = rxForm<SimpleFormProps>({
      debounce: 400,
      fields: {
        test: {},
      },
      throttle: 677,
    })(MyForm)
    const mounted = mount(<DecoratedComponent onSubmit={onSubmit} />)
    const instance = mounted.instance() as any

    expect(instance.formElement).toBeInstanceOf(HTMLFormElement)
  })

  it('should throw an error if no form tag is present in the dacorated component', () => {
    console.error = jest.fn()
    class MyForm extends React.Component {
      render() {
        return (
          <div>
            <input name="test" />
          </div>
        )
      }
    }
    const DecoratedComponent = rxForm<SimpleFormProps>({
      debounce: 400,
      fields: {
        test: {},
      },
      throttle: 677,
    })(MyForm)
    expect(() => {
      mount(<DecoratedComponent onSubmit={onSubmit} />)
    }).toThrow(RxFormError.FORM)
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

    it('should have state submitted : true when form is submitted', () => {
      const DecoratedComponent = rxForm({
        fields: {
          test: {},
        },
        valueChangeObs: true,
      })(SimpleForm)
      const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)
      const instance = mounted.instance()

      formElement.dispatchEvent(new Event('submit'))

      expect(instance.state.submitted).toBeTruthy()
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
      instance.handleValueChangeSuccess({ test: { value: 'test' }, remember: { value: true } })

      expect(setStateSpy).toHaveBeenCalled()
    })
  })

  describe('input initialisation', () => {
    describe('basic inputs (text, email ...)', () => {
      let textElement: HTMLInputElement

      class TextForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input name="text" ref={c => (textElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }

      beforeEach(() => {
        console.error = jest.fn()
      })

      it('should properly assign value to text inputs', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            text: {
              value: 'foo',
            },
          },
        })(TextForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(textElement.value).toBe('foo')
      })

      it('should throw an error if value is not a string', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            text: {
              value: true,
            },
          },
        })(TextForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`text ${RxFormError.TYPE} string`)
      })
    })

    describe('checkbox elements', () => {
      let checkboxElement: HTMLInputElement

      class CheckboxForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input type="checkbox" name="check" ref={c => (checkboxElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }

      it('should properly check the checkbox according to the boolean value', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            check: {
              value: true,
            },
          },
        })(CheckboxForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(checkboxElement.checked).toBeTruthy()
      })

      it('should throw an error if value is not a boolean', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            check: {
              value: 'true',
            },
          },
        })(CheckboxForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`check ${RxFormError.TYPE} boolean`)
      })
    })

    describe('radio button element', () => {
      let radioElement: HTMLInputElement
      let secondRadioElement: HTMLInputElement

      class RadioForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input
                type="radio"
                name="gender"
                value="female"
                ref={c => (secondRadioElement = c as HTMLInputElement)}
              />
              <input type="radio" name="gender" value="male" ref={c => (radioElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }
      it('should properly check the correct radio', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            gender: {
              value: 'male',
            },
          },
        })(RadioForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(radioElement.checked).toBeTruthy()
        expect(secondRadioElement.checked).toBeFalsy()
      })

      it('should throw an error if the value is not a string', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            gender: {
              value: true,
            },
          },
        })(RadioForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`gender ${RxFormError.TYPE} string`)
      })
    })

    describe('date element', () => {
      let dateElement: HTMLInputElement
      const date = new Date()

      class DateForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input type="date" name="birthdate" ref={c => (dateElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }

      it('should properly assign value to date input', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            birthdate: {
              value: date,
            },
          },
        })(DateForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(dateElement.value).toBe(date.toISOString().substr(0, 10))
      })

      it('should throw an error if value is not a Date', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            birthdate: {
              value: true,
            },
          },
        })(DateForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`birthdate ${RxFormError.TYPE} Date`)
      })
    })

    describe('range input', () => {
      let rangeElement: HTMLInputElement

      class RangeForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input type="range" name="age" ref={c => (rangeElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }

      it('should properly assign value to range input', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            age: {
              value: 5,
            },
          },
        })(RangeForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(rangeElement.value).toBe('5')
      })

      it('should throw an error if the value is not a number', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            age: {
              value: true,
            },
          },
        })(RangeForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`age ${RxFormError.TYPE} number`)
      })
    })

    describe('number input', () => {
      let numberElement: HTMLInputElement

      class NumberForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <input type="number" name="amount" ref={c => (numberElement = c as HTMLInputElement)} />
            </form>
          )
        }
      }

      it('should propely assign value to number element', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            amount: {
              value: 5,
            },
          },
        })(NumberForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(numberElement.value).toBe('5')
      })

      it('should throw an error if the value is not number', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            amount: {
              value: 'sfsd',
            },
          },
        })(NumberForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`amount ${RxFormError.TYPE} number`)
      })
    })

    describe('select elements', () => {
      let selectElement: HTMLSelectElement
      let firstOption: HTMLOptionElement
      let secondOption: HTMLOptionElement

      class SelectForm extends React.Component<SimpleFormProps> {
        render() {
          return (
            <form>
              <select name="country" ref={c => (selectElement = c as HTMLSelectElement)}>
                <option value="grh" ref={c => (firstOption = c as HTMLOptionElement)}>
                  Groland du haut
                </option>
                <option value="grb" ref={c => (secondOption = c as HTMLOptionElement)}>
                  Groland du bas
                </option>
              </select>
            </form>
          )
        }
      }

      it('should properly assign the value to the select element', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            country: {
              value: 'grh',
            },
          },
        })(SelectForm)
        mount(<ReactiveForm onSubmit={jest.fn()} />)
        expect(firstOption.selected).toBeTruthy()
        expect(secondOption.selected).toBeFalsy()
      })

      it('should throw an error if the value is not a string', () => {
        const ReactiveForm = rxForm<SimpleFormProps>({
          fields: {
            country: {
              value: 34,
            },
          },
        })(SelectForm)
        expect(() => {
          mount(<ReactiveForm onSubmit={jest.fn()} />)
        }).toThrow(`country ${RxFormError.TYPE} string`)
      })
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
          fields: {
            test: {},
          },
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
