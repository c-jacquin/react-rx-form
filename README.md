# Rx-React-Form
# Form management Higher order component for react app using rxjs

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/charjac/react-rx-form/badge.svg)](https://coveralls.io/github/charjac/react-rx-form)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

- [Presentation](#presentation)
- [Install](#install)
- [Requirement](#requirement)
- [Example](#example)

## [Check the demo](https://charjac.github.io/react-rx-form/)

## Install
```bash
npm i rx-react-form -S
```
or
```bash
yarn add rx-react-form
```

## Presentation

React Higher order component that manage form using rxjs Observable (like in angular2 or 4 whatever)

## Requirement

 - React
 - Rxjs

## Example

### Simple form
```ts
import { rxForm } from 'rx-react-form'

interface Props {
    onSubmit: () => void
    onError?: () => void
    name: string
}

@rxForm<Props>({
    debounce: 1000,
    fields: {
        name: {
            validation: (value) => {
                if (value.length > 0) {
                    return 'name should be defined'
                }
            },
            value: (props) => {
                return props.name
            }
        },
        email: {}
    }
})
class SimpleForm extends React.Component<Props, any> {
    render() {
        return (
            <form>
                <div>
                    <input name="name" placeholder="enter your name" />
                    { !!this.props.name.error &&
                        <span>{ this.props.name.error }</span>
                    }
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

<SimpleForm name="john snow" onSubmit={...} onError={...} />
```
