import React from 'react'

interface ReactRxForm {
    rxForm<Props> (fields:any): React.Component<Props, any>
}

declare var reactRxForm: ReactRxForm

export default reactRxForm