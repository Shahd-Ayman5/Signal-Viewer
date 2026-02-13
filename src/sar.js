import "./CSS_files/sar.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CiHome } from "react-icons/ci";

function SARViewer() {
  const navigate = useNavigate();
  const [sarData, setSarData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load SAR data automatically on component mount
  useEffect(() => {
    analyzeSAR();
  }, []);

  const analyzeSAR = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/sar/analyze_sar");
      const result = await response.json();
      
      if (result.status === "success") {
        setSarData(result);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze SAR data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sar-container">
      {/* Header Icons */}
      <div className="sar-icons">
        <div className="icon-container" onClick={() => navigate("/")}>
          <CiHome size={30} color="#6ac1e4" />
          <span className="icon-label">Home</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing existing SAR data...</p>
        </div>
      )}

      {/* SAR Data Visualization */}
      {sarData && !loading && (
        <div className="sar-content">
          {/* Side by Side Images - Compact View */}
          <div className="sar-section">
            <h2>📡 SAR Images Comparison</h2>
            <div className="images-compact-grid">
              <div className="image-compact-item">
                <h3 className="location-title-small">Mine</h3>
                <div className="image-container-compact">
                  <img src={sarData.mine.images.colormap} alt="Mine" />
                </div>
              </div>
              
              <div className="image-compact-item">
                <h3 className="location-title-small rotterdam">Port - mostly water</h3>
                <div className="image-container-compact">
                  <img src={sarData.rotterdam.images.colormap} alt="Rotterdam" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed View */}
          <div className="sar-section">
            <h2>Detailed Comparison</h2>
            <div className="comparison-grid">
              {/* Mine */}
              <div className="comparison-column">
                <h3 className="location-title">Mine</h3>
                
                <div className="stats-grid-small">
                  <div className="stat-card-small">
                    <span className="stat-label">Mean</span>
                    <span className="stat-value-small">{sarData.mine.statistics.mean.toFixed(2)}</span>
                  </div>
                  <div className="stat-card-small">
                    <span className="stat-label">Std Dev</span>
                    <span className="stat-value-small">{sarData.mine.statistics.std.toFixed(2)}</span>
                  </div>
                </div>


                <div className="image-container">
                  <img src={sarData.mine.images.grayscale} alt="Mine Grayscale" />
                </div>
              </div>

              {/* Rotterdam */}
              <div className="comparison-column">
                <h3 className="location-title rotterdam">Port</h3>
                
                <div className="stats-grid-small">
                  <div className="stat-card-small">
                    <span className="stat-label">Mean</span>
                    <span className="stat-value-small">{sarData.rotterdam.statistics.mean.toFixed(2)}</span>
                  </div>
                  <div className="stat-card-small">
                    <span className="stat-label">Std Dev</span>
                    <span className="stat-value-small">{sarData.rotterdam.statistics.std.toFixed(2)}</span>
                  </div>
                </div>

                <div className="image-container">
                  <img src={sarData.rotterdam.images.grayscale} alt="Rotterdam Grayscale" />
                </div>
              </div>
            </div>
          </div>

          {/* Histograms */}
          <div className="sar-section">
            <h2>Intensity Histograms</h2>
            <div className="comparison-grid">
              <div className="comparison-column">
                <h3 className="location-title">Mine - mid peak</h3>
                <div className="image-container">
                  <img src={sarData.mine.images.histogram} alt="Mine Histogram" />
                 <h3 >Wide range : high contrast</h3>

                </div>
              </div>
              <div className="comparison-column">
                <h3 className="location-title rotterdam">Port - left peak</h3>
                <div className="image-container">
                  <img src={sarData.rotterdam.images.histogram} alt="Rotterdam Histogram" />
                <h3 >Narrow range : low contrast</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - only show initially before first load */}
      {!sarData && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <h3>Loading SAR Data...</h3>
          <p>Analyzing ICEYE SAR imagery</p>
        </div>
      )}
    </div>
  );
}

export default SARViewer;
