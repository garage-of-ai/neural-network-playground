import DatasetPreview from "./DatasetPreview";

function DatasetPanel() {
    return (
        <div className="panel dataset-panel">
            <div className="title">Tập dữ liệu</div>
            <div className="dataset-carousel">
                <button className="carousel-arrow carousel-arrow--left"/>
                <div className="dataset-focus">
                    <DatasetPreview />
                    <div className="dataset-name"></div>
                </div>
                <button className="carousel-arrow carousel-arrow--right"/>
            </div>
            <button className="doodle-btn primary dataset-confirm">
                Chọn dataset này
            </button>
        </div>
    )
}

export default DatasetPanel;