import * as React from 'react'
import autobind from 'autobind-decorator'

import { WizardParams, WizardProps, WizardState, FormValues, RequiredProps } from '../types'

export const wizard = function<Props extends RequiredProps>({ initialStep = 0, steps }: WizardParams<Props>) {
  return (Comp: React.ComponentClass<Props & WizardProps> | any) => {
    class RxWizardForm extends React.Component<Props, WizardState> {
      static displayName = `WizardForm(${Comp.displayName || Comp.name})`

      steps = typeof steps === 'function' ? steps(this.props) : steps

      state = {
        currentStep: initialStep,
        formExtraProps: {},
        formValue: {},
        submitted: false,
        totalSteps: this.steps.length,
      }

      @autobind
      goTo(step: number, formExtraProps: any): void {
        this.setState({
          currentStep: step,
          formExtraProps,
        })
      }

      @autobind
      handleSubmit(formValue: FormValues): void {
        const submitted = this.state.currentStep === this.steps.length - 1
        const currentStep = submitted ? this.state.currentStep : this.state.currentStep + 1

        this.setState(
          {
            currentStep,
            formExtraProps: {
              ...this.state.formExtraProps,
              ...formValue,
            },
            formValue: {
              ...this.state.formValue,
              ...formValue,
            },
            submitted,
          },
          () => {
            if (submitted) {
              this.props.onSubmit(this.state.formValue)
            }
          },
        )
      }

      @autobind
      handleGoBack() {
        if (this.state.currentStep !== 0) {
          this.setState({
            currentStep: this.state.currentStep - 1,
          })
        }
      }

      @autobind
      renderCurrentForm(): JSX.Element {
        const { currentStep, formExtraProps } = this.state
        const FormComponent = this.steps[currentStep]

        return (
          <FormComponent
            {...this.props}
            {...formExtraProps}
            goBack={this.handleGoBack}
            onSubmit={this.handleSubmit}
            onError={this.props.onError}
          />
        )
      }

      render(): JSX.Element {
        return <Comp goTo={this.goTo} renderCurrentForm={this.renderCurrentForm} {...this.state} {...this.props} />
      }
    }

    return RxWizardForm
  }
}
