### Simple usecase

```jsx
const { rxForm } = require('./index');

class SimpleForm extends React.Component {
    render() {
        return (
            <form>
                <div>
                    <input name="name" placeholder="enter your name" />
                </div>
                <div>
                    <input name="email" placeholder="modify your email" />
                </div>
                <div>
                    <button type="submit">Submit form</button>
                </div>
            </form>
        )
    }
}

const RxSimpleForm = rxForm({
    fields: {
        name: {
            value: 'John'
        },
        email: {
            value: (props) => props.foo
        }
    }
})(SimpleForm);

const onSubmit = (formValue) => {
    console.log('form submitted ===> ', formValue)
};

<RxSimpleForm foo="john.snow@nightwatch.com" onSubmit={onSubmit} />
```

### Email Validation

```jsx
const { rxForm } = require('./index');

class SimpleForm extends React.Component {
    render() {
        return (
            <form>
                <div>
                    <input name="email" placeholder="modify your email" />
                    { !!this.props.email.error &&
                        <div style={{ color: 'red' }}>
                            { this.props.email.error }
                        </div>
                    }
                </div>
                <div>
                    <button type="submit">Submit form</button>
                </div>
            </form>
        )
    }
}

const RxSimpleForm = rxForm({
    fields: {
        email: {
            value: (props) => props.foo,
            validation: (value) => {
                const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!emailRegex.test(value)) {
                    return 'you must enter a valid email'
                }
            }
        }
    }
})(SimpleForm);

const onSubmit = (formValue) => {
    console.log('form submitted ===> ', formValue)
};

<RxSimpleForm foo="john.snow.nightwatch.com" onSubmit={onSubmit} />
```

### Different password validation

```jsx
const { rxForm } = require('./index');

class SimpleForm extends React.Component {
    render() {
        return (
            <form>
                <div>
                    <input name="pass" type="password" placeholder="modify your password" />
                </div>
                <div>
                    <input name="repeatPass" type="password" placeholder="repeat your password" />
                    { !!this.props.repeatPass.error &&
                        <div style={{ color: 'red' }}>
                            { this.props.repeatPass.error }
                        </div>
                    }
                </div>
                <div>
                    <button type="submit">Submit form</button>
                </div>
            </form>
        )
    }
}

const RxSimpleForm = rxForm({
    fields: {
        pass: {},
        repeatPass: {
            validation: (value, { pass }) => {
                if (value.length > 0 && pass.value.length > 0) {
                    if (pass.value !== value) {
                        return 'password are not identical'
                    }
                }
            }
        }
    }
})(SimpleForm);

const onSubmit = (formValue) => {
    console.log('form submitted ===> ', formValue)
};

<RxSimpleForm onSubmit={onSubmit} />
```

### valueChange$ Observable
> check the console

```jsx
const { rxForm } = require('./index');

class SimpleForm extends React.Component {
    componentDidMount() {
        this.props.valueChange$.subscribe((formValues) => {
            console.log('Form values ====>', formValues)
        })
    }

    render() {
        return (
            <form>
                <div>
                    <input name="email" placeholder="modify your email" />
                </div>
                <div>
                    <button type="submit">Submit form</button>
                </div>
            </form>
        )
    }
}

const RxSimpleForm = rxForm({
    fields: {
        email: {},
    },
    valueChangeObs: true
})(SimpleForm);

const onSubmit = (formValue) => {
    console.log('form submitted ===> ', formValue)
};

<RxSimpleForm onSubmit={onSubmit} />
```

### debounce, throttle
```jsx
const { rxForm } = require('./index');

class SimpleForm extends React.Component {
    render() {
        return (
            <form>
                <div>
                    <input name="email" placeholder="modify your email" />
                    { !!this.props.email.error &&
                        <div style={{ color: 'red' }}>
                            { this.props.email.error }
                        </div>
                    }
                </div>
                <div>
                    <button type="submit">Submit form</button>
                </div>
            </form>
        )
    }
}

const RxSimpleForm = rxForm({
    fields: {
        email: {
            value: (props) => props.foo,
            validation: (value) => {
                const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!emailRegex.test(value)) {
                    return 'you must enter a valid email'
                }
            }
        }
    },
    debounce: 5000,
    throttle: 0
})(SimpleForm);

const onSubmit = (formValue) => {
    console.log('form submitted ===> ', formValue)
};

<RxSimpleForm foo="john.snow.nightwatch.com" onSubmit={onSubmit} />
```