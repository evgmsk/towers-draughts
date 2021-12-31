import React, { Suspense } from 'react'
import Spinner from '../../page-components/spinners/Spinner'



export const RulesPage: React.FC = () => (
    <Suspense fallback={<Spinner />}>
        <div className="page">
            Rules
        </div>
    </Suspense>
)

export default RulesPage
