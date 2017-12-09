import * as React from 'react'
import { WizardProps } from '../../types'

/**
 * Helper wich render a dead simple wizard
 * @param param - the props from wizard HoC
 * @return {JSX.Element} the currentForm of the wizard
 */
export const SimpleWizard: React.SFC<WizardProps> = ({ renderCurrentForm }) => renderCurrentForm()
