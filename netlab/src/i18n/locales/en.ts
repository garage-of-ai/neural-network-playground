const en = {
    language: {
        picker: 'Change language',
    },
    errorBanner: {
        closeAria: 'Dismiss notification',
    },
    trainingControls: {
        connecting: 'Connecting to server...',
        stepTitle: 'Train 1 step',
        step: 'Step',
        epochTitle: 'Train 1 epoch',
        epoch: 'Run epoch',
        playTitle: 'Train / Pause',
        pause: 'Pause',
        play: 'Auto run',
        reset: 'Reset',
    },
    datasetPanel: {
        title: 'Dataset',
        prevAria: 'Previous dataset',
        nextAria: 'Next dataset',
        selected: 'Selected',
        confirm: 'Use this dataset',
        trainTest: 'Train / Test',
        noise: 'Noise',
    },
    checkPanel: {
        title: 'Results',
        accuracy: 'Accuracy',
        decisionBoundary: 'Decision boundary',
    },
    networkArchitecture: {
        title: 'Network',
        legendPositive: 'positive',
        legendNegative: 'negative',
        weightInitLabel: 'Weight Init',
    },
    abstractArchitecture: {
        title: 'Edit architecture',
        lockTag: 'Reset to change architecture',
        insertLayerAria: 'Insert new layer',
        deleteLayerAria: 'Delete layer',
        deleteLayerConfirmAria: 'Click again to confirm delete',
        deleteConfirmLabel: 'Delete?',
        decreaseUnitAria: 'Decrease units',
        increaseUnitAria: 'Increase units',
        unitCount: (n: number) => `${n} unit${n > 1 ? 's' : ''}`,
    },
    networkControls: {
        zoomIn: 'zoom in',
        fitView: 'fit view',
        zoomOut: 'zoom out',
    },
    trainConfig: {
        title: 'Training configuration',
        optimizer: 'Optimizer',
        learningRate: 'Learning rate',
        batchSize: 'Batch size',
        epochs: 'Epochs',
    },
    footer: {
        credit: 'Lam Duc Anh - University of Engineering and Technology, VNU',
    },
    layerKind: {
        input: 'Input',
        hidden: 'Hidden Layer',
        output: 'Output',
    },
}

export default en
export type Dictionary = typeof en
