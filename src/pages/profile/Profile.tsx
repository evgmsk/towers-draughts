import React, { Suspense } from 'react'
import Spinner from '../../page-components/spinners/Spinner'



const ProfilePage: React.FC = () => (
    <Suspense fallback={<Spinner />}>
        <div  className="page">
            Setting Page
        </div>
    </Suspense>
)

export default ProfilePage