import type { ReactNode } from 'react'
import { EngineProvider } from './EngineContext'
import { DatasetProvider } from './DatasetContext'
import { NetworkProvider } from './NetworkContext'
import { TrainingProvider } from './TrainingContext'
import { LocaleProvider } from './LocaleContext'

function AppProviders({ children }: { children: ReactNode }) {
    return (
        <LocaleProvider>
            <EngineProvider>
                <DatasetProvider>
                    <NetworkProvider>
                        <TrainingProvider>{children}</TrainingProvider>
                    </NetworkProvider>
                </DatasetProvider>
            </EngineProvider>
        </LocaleProvider>
    )
}

export default AppProviders
