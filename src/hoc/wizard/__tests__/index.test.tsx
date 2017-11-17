/* tslint:disable:max-classes-per-file */
import * as React from 'react'
import { mount } from 'enzyme'
import { wizard } from '../'
import { rxForm } from '../../rxForm'

class FirstStep extends React.Component<any, any> {
  render() {
    return (
      <form>
        <h3>First step</h3>
        <input name="name" placeholder="enter your name" />
        <button type="submit">Next</button>
      </form>
    )
  }
}

class SecondStep extends React.Component<any, any> {
  render() {
    return (
      <form>
        <h3>Second step</h3>
        <input type="date" name="date" placeholder="enter your birthdate" />
        <button type="submit">Next</button>
      </form>
    )
  }
}

class FinalStep extends React.Component<any, any> {
  render() {
    return (
      <form>
        <h3>Thrid step</h3>
        <input type="number" name="age" placeholder="enter your age" />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

class MainForm extends React.Component<any> {
  render() {
    return (
      <section>
        <header>Wizard Form !!!!</header>
        {this.props.renderCurrentForm()}
        <footer>Still the wizard form !!!!</footer>
      </section>
    )
  }
}

describe('wizard hoc', () => {
  let ReactiveFirstStep
  let ReactiveSecondStep
  let ReactiveFinalStep
  let TestWizard

  beforeEach(() => {
    ReactiveFirstStep = rxForm<any>({
      fields: {
        name: {},
      },
    })(FirstStep)

    ReactiveSecondStep = rxForm<any>({
      fields: {
        date: {},
      },
    })(SecondStep)

    ReactiveFinalStep = rxForm<any>({
      fields: {
        age: {},
      },
    })(FinalStep)

    TestWizard = wizard<any>({
      steps: [ReactiveFirstStep, ReactiveSecondStep, ReactiveFinalStep],
    })(MainForm)
  })
  it('should render a form element', () => {
    expect(mount(<TestWizard />).find('form')).toBeDefined()
  })

  describe('goTo method', () => {
    it('should calls setState', () => {
      const setStateSpy = jest.spyOn(TestWizard.prototype, 'setState')
      const mounted = mount(<TestWizard />)
      mounted.instance().goTo(1)

      expect(setStateSpy).toHaveBeenCalledWith({
        currentStep: 1,
      })
    })
  })

  describe('handleSubmit', () => {
    it('should call setState', () => {
      const setStateSpy = jest.spyOn(TestWizard.prototype, 'setState')
      const mounted = mount(<TestWizard />)
      mounted.instance().handleSubmit({})
      expect(setStateSpy).toHaveBeenCalled()
    })

    it('should submit the form if lastStep is active', () => {
      TestWizard = wizard<any>({
        initialStep: 2,
        steps: [ReactiveFirstStep, ReactiveSecondStep, ReactiveFinalStep],
      })(MainForm)
      const props = {
        onSubmit: console.log,
      }
      const onSubmitSpy = jest.spyOn(props, 'onSubmit')
      const mounted = mount(<TestWizard {...props} />)
      mounted.instance().handleSubmit({})
      expect(onSubmitSpy).toHaveBeenCalled()
    })
  })
})
