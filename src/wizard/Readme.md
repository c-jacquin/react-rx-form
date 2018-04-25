# Example

```jsx
const { rxForm } = require('../rxForm')
const { wizard } = require('./index')

class FirstStep extends React.Component {
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
const ReactiveFirstStep = rxForm({
    fields: {
        name: {}
    }
})(FirstStep)

class SecondStep extends React.Component {
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

const ReactiveSecondStep = rxForm({
    fields: {
        date: {
            validation(value) {
                if(!(value instanceof Date)) {
                    return 'a date must be defined'
                }
            }
        }
    }
})(SecondStep)

class FinalStep extends React.Component {
    render(){
        return (
            <form>
                <h3>Thrid step</h3>
                <input type="number" name="age" placeholder="enter your age" />
                <button type="submit">Submit</button>
            </form>
        )
    }
}
const ReactiveFinalStep = rxForm({
    fields: {
        age: {}
    }
})(FinalStep)

class MainForm extends React.Component {
    render() {
        return (
            <section>
                <header>
                    Wizard Form !!!!
                </header>
                    {this.props.renderCurrentForm()}
                <footer>
                    Step {this.props.currentStep + 1} / {this.props.totalSteps}
                </footer>
            </section>
        )
    }
}
const ReactiveWizard = wizard({
    steps: [
        ReactiveFirstStep,
        ReactiveSecondStep,
        ReactiveFinalStep
    ]
})(MainForm);

<ReactiveWizard onSubmit={console.log} onError={console.error} />
```