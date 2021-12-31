import React, { Suspense } from 'react'
import Spinner from '../../page-components/spinners/Spinner'



export const SettingsPage: React.FC = () => (
    <Suspense fallback={<Spinner />}>
        <div  className="page">
            Setting Page
        </div>
    </Suspense>
)

export default SettingsPage