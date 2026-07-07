import type { ReactNode } from 'react'
import { DatasetProvider } from './DatasetContext'
import { NetworkProvider } from './NetworkContext'
import { TrainingProvider } from './TrainingContext'

function AppProviders({ children }: { children: ReactNode }) {
    return (
        <DatasetProvider>
            <NetworkProvider>
                <TrainingProvider>{children}</TrainingProvider>
            </NetworkProvider>
        </DatasetProvider>
    )
}

export default AppProviders
