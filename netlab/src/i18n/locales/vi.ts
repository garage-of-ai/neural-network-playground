import type { Dictionary } from './en'

const vi: Dictionary = {
    language: {
        picker: 'Đổi ngôn ngữ',
    },
    errorBanner: {
        closeAria: 'Đóng thông báo',
    },
    trainingControls: {
        connecting: 'Đang kết nối máy chủ...',
        stepTitle: 'Huấn luyện 1 bước',
        step: 'Chạy 1 bước',
        epochTitle: 'Huấn luyện 1 vòng',
        epoch: 'Chạy 1 vòng',
        playTitle: 'Huấn luyện / Tạm dừng',
        pause: 'Tạm dừng',
        play: 'Chạy liên tục',
        reset: 'Reset',
    },
    datasetPanel: {
        title: 'Tập dữ liệu',
        prevAria: 'Dataset trước',
        nextAria: 'Dataset kế tiếp',
        selected: 'Đã chọn',
        confirm: 'Chọn dataset này',
        trainTest: 'Train / Test',
        noise: 'Nhiễu (noise)',
    },
    checkPanel: {
        title: 'Kết quả',
        accuracy: 'Độ chính xác',
        decisionBoundary: 'Biên quyết định',
    },
    networkArchitecture: {
        title: 'Kiến trúc mạng',
        legendPositive: 'dương',
        legendNegative: 'âm',
        weightInitLabel: 'Khởi tạo trọng số',
    },
    abstractArchitecture: {
        title: 'Chỉnh sửa kiến trúc',
        lockTag: 'Reset để thay đổi kiến trúc',
        insertLayerAria: 'Chèn layer mới',
        deleteLayerAria: 'Xoá layer',
        deleteLayerConfirmAria: 'Bấm lần nữa để xác nhận xoá layer',
        deleteConfirmLabel: 'Xoá?',
        decreaseUnitAria: 'Giảm số unit',
        increaseUnitAria: 'Tăng số unit',
        unitCount: (n: number) => `${n} unit`,
    },
    networkControls: {
        zoomIn: 'phóng to',
        fitView: 'vừa khung',
        zoomOut: 'thu nhỏ',
    },
    trainConfig: {
        title: 'Cấu hình huấn luyện',
        optimizer: 'Optimizer',
        learningRate: 'Learning rate',
        batchSize: 'Batch size',
        epochs: 'Số epoch',
        orCustomValue: 'hoặc nhập số khác',
        customValuePlaceholder: 'Tuỳ chỉnh...',
        customValueInUse: 'đang dùng',
    },
    footer: {
        credit: 'Lâm Đức Anh - Trường Đại học Công nghệ, ĐHQGHN',
    },
    layerKind: {
        input: 'Đầu vào',
        hidden: 'Tầng ẩn',
        output: 'Đầu ra',
    },
}

export default vi
