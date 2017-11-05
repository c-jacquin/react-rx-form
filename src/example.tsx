import * as React from 'react'
import { render } from 'react-dom'
import { rxForm } from './index'

const rootElement = document.getElementById('app')

interface ExampleProps {
    onSubmit: () => void
}

@rxForm<ExampleProps>({
    fields: {
        email: {
            validation: () => undefined,
            value: '',
        },
    },
})
class ExampleApp extends React.Component<ExampleProps, any> {
    render() {
        console.log('props', this.props)

        return (
            <form>
                <input name="email" />
            </form>
        )
    }
}

const handler = () => {
    console.log('submit')
}

console.log(render)

render(<ExampleApp onSubmit={handler} />, rootElement)
