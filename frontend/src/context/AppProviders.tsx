import type { ReactNode } from 'react'
import { SocketProvider } from './SocketContext'
import { DatasetProvider } from './DatasetContext'
import { NetworkProvider } from './NetworkContext'
import { TrainingProvider } from './TrainingContext'

function AppProviders({ children }: { children: ReactNode }) {
    return (
        <SocketProvider>
            <DatasetProvider>
                <NetworkProvider>
                    <TrainingProvider>{children}</TrainingProvider>
                </NetworkProvider>
            </DatasetProvider>
        </SocketProvider>
    )
}

export default AppProviders
