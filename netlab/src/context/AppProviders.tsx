import type { ReactNode } from 'react'
import { EngineProvider } from './EngineContext'
import { DatasetProvider } from './DatasetContext'
import { NetworkProvider } from './NetworkContext'
import { TrainingProvider } from './TrainingContext'

function AppProviders({ children }: { children: ReactNode }) {
    return (
        <EngineProvider>
            <DatasetProvider>
                <NetworkProvider>
                    <TrainingProvider>{children}</TrainingProvider>
                </NetworkProvider>
            </DatasetProvider>
        </EngineProvider>
    )
}

export default AppProviders
