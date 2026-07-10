import './App.css'
import AppProviders from './context/AppProviders'
import AbstractArchitecture from './components/architectures/AbstractArchitecture'
import CheckPanel from './components/training/CheckPanel'
import DatasetPanel from './components/datasets/DatasetPanel'
import ErrorBanner from './components/layouts/ErrorBanner'
import Footer from './components/layouts/Footer'
import Header from './components/layouts/Header'
import NetworkArchitecture from './components/architectures/NetworkArchitecture'
import TrainConfigPanel from './components/training/TrainConfigPanel'
import TrainingControls from './components/training/TrainingControls'

function App() {
    return(
        <AppProviders>
            <div id="netlab">
                <Header />
                <ErrorBanner />
                <div className="content">
                    <div className="col left">
                        <DatasetPanel />
                        <TrainConfigPanel />
                    </div>
                    <div className="col center">
                        <NetworkArchitecture />
                        <AbstractArchitecture />
                    </div>
                    <div className="col right">
                        <TrainingControls />
                        <CheckPanel />
                    </div>
                </div>
                <Footer />
            </div>
        </AppProviders>
    )
}

export default App
