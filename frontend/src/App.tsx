import './App.css'
import AbstractArchitecture from './components/architectures/AbstractArchitecture'
import CheckPanel from './components/CheckPanel'
import DatasetPanel from './components/datasets/DatasetPanel'
import Footer from './components/layouts/Footer'
import Header from './components/layouts/Header'
import NetworkArchitecture from './components/architectures/NetworkArchitecture'
import TrainConfigPanel from './components/TrainConfigPanel'
import TrainingControls from './components/TrainingControls'

function App() {
    return(
        <div id="netlab">
            <Header />
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
    )
}

export default App