// import "./CSS_files/eeg.css";
import "./CSS_files/detect.css";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleUp } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { LuAudioWaveform } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import Plot from "react-plotly.js";

function Detect() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showWave, setShowWave] = useState(false);
  const [currentVelocity, setCurrentVelocity] = useState(0);
  
  const [fApproach, setFApproach] = useState(null);
  const [fRecede, setFRecede] = useState(null);
  const [timeApproach, setTimeApproach] = useState(null);
  const [timeRecede, setTimeRecede] = useState(null);
  
  const [f0Calculated, setF0Calculated] = useState(null);
  const [velocityCalculated, setVelocityCalculated] = useState(null);
  
  const audioRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file.name);
      const res = await fetch("http://127.0.0.1:5000/upload_car", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed with status:", res.status);
        throw new Error("Failed to upload file");
      }

      const json = await res.json();
      console.log("Received data from backend:", json);
      setData(json);
      audioRef.current.src = URL.createObjectURL(file);
      console.log("Audio source set:", audioRef.current.src);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleWave = () => {
    if (!data) {
      console.error("No data available to display spectrogram");
      alert("No data available. Please upload a file first.");
      return;
    }
    if (!audioRef.current) {
      console.error("Audio reference is not available");
      return;
    }
    console.log("Attempting to play audio and show spectrogram");
    setShowWave(true);
    audioRef.current.play().catch((error) => {
      console.error("Error playing audio:", error);
      alert("Failed to play audio. Please try playing it manually using the audio controls.");
    });
  };

  const autoDetectFrequencies = () => {
    if (!data || !data.frequencies) {
      alert("No data available for automatic detection!");
      return;
    }

    const frequencies = data.frequencies;
    const times = data.times;
    const totalLength = frequencies.length;

    // تجاهل أول وآخر 15% من الصوت
    const startIndex = Math.floor(totalLength * 0.15);
    const endIndex = Math.floor(totalLength * 0.85);
    const validFreqs = frequencies.slice(startIndex, endIndex);
    const validTimes = times.slice(startIndex, endIndex);

    // استخدام percentiles بدل max/min لتجنب outliers
    const sortedFreqs = [...validFreqs].sort((a, b) => a - b);
    const percentile98Index = Math.floor(sortedFreqs.length * 0.98);
    const percentile2Index = Math.floor(sortedFreqs.length * 0.02);
    
    const maxFreq = sortedFreqs[percentile98Index];
    const minFreq = sortedFreqs[percentile2Index];

    // إيجاد الـ indices في الـ array الأصلي
    const maxFreqIndex = validFreqs.findIndex(f => Math.abs(f - maxFreq) < 0.01) + startIndex;
    const minFreqIndex = validFreqs.findIndex(f => Math.abs(f - minFreq) < 0.01) + startIndex;

    // تحديث الـ state
    setFApproach(maxFreq);
    setTimeApproach(times[maxFreqIndex]);
    setFRecede(minFreq);
    setTimeRecede(times[minFreqIndex]);

    console.log(`Auto-detected: Approach = ${maxFreq.toFixed(2)} Hz at ${times[maxFreqIndex].toFixed(2)}s`);
    console.log(`Auto-detected: Recede = ${minFreq.toFixed(2)} Hz at ${times[minFreqIndex].toFixed(2)}s`);

    const c = 343; // m/s
    const f0 = Math.sqrt(maxFreq * minFreq); 
    const v = c * (maxFreq - minFreq) / (maxFreq + minFreq);
    
    setF0Calculated(f0);
    setVelocityCalculated(v);
    
    console.log(`Calculated: f₀ = ${f0.toFixed(2)} Hz, v = ${v.toFixed(2)} m/s`);
    console.log(`Frequency difference: ${(maxFreq - minFreq).toFixed(2)} Hz`);
    console.log(`Ratio: ${(maxFreq / minFreq).toFixed(4)}`);
  };

  useEffect(() => {
    if (!audioRef.current || !data) {
      return;
    }

    const updateVelocity = () => {
      const currentTime = audioRef.current.currentTime;
      const { times, velocities } = data;

      let closestIndex = 0;
      let minDiff = Math.abs(times[0] - currentTime);
      for (let i = 1; i < times.length; i++) {
        const diff = Math.abs(times[i] - currentTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      setCurrentVelocity(velocities[closestIndex].toFixed(2));
    };

    audioRef.current.addEventListener("timeupdate", updateVelocity);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateVelocity);
      }
    };
  }, [data]);

  return (
    <div className="det">
      <div className="icons">
        <span className="icon">
          <label htmlFor="fileUpload">
            <FaArrowCircleUp size={30} color="purple" style={{ cursor: "pointer" }} />
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".wav"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </span>
        <span className="icon" onClick={() => navigate("/")}>
          <HiOutlineLockClosed size={30} color="purple" />
        </span>
        <span className="icon" onClick={handleWave}>
          <LuAudioWaveform size={30} color="purple" />
        </span>
      </div>

      <h1 > Doppler Effect Analysis</h1>
      <audio ref={audioRef} controls className="car-audio-player" />
      
      {showWave && data ? (
        <div>
          <div className="car-auto-detect-banner">
            <button onClick={autoDetectFrequencies} className="car-btn-auto-detect">
              Frequency & Velocity
            </button>
          </div>
          
          <Plot className="plot"
            data={[
              {
                z: data.spectrogram,
                x: data.times,
                y: data.freq_axis,
                type: "heatmap",
                colorscale: "Jet",
                colorbar: {
                  title: "dB",
                  titleside: "right"
                }
              },
              ...(fApproach ? [{
                x: [timeApproach],
                y: [fApproach],
                mode: "markers",
                marker: {
                  color: "red",
                  size: 15,
                  symbol: "x"
                },
                name: "Approach",
                showlegend: true
              }] : []),
              ...(fRecede ? [{
                x: [timeRecede],
                y: [fRecede],
                mode: "markers",
                marker: {
                  color: "blue",
                  size: 15,
                  symbol: "x"
                },
                name: "Recede",
                showlegend: true
              }] : []),
            ]}
            layout={{
              title: "Spectrogram - Automatic Frequency Detection",
              xaxis: { 
                title: "Time (s)", 
                range: [0, data.times[data.times.length - 1]],
                showgrid: true
              },
              yaxis: { 
                title: "Frequency (Hz)",
                showgrid: true
              },
              autosize: true,
              margin: { t: 50, b: 50, l: 60, r: 60 }
            }}
            style={{ width: "100%", height: "500px" }}
            config={{ responsive: true }}
          />

          <div className="car-calculator-section">
            
            <div className="car-selection-grid">
              <div className={`car-phase-card ${fApproach ? 'car-phase-approach' : ''}`}>
                <h4 className="car-phase-title-red">Approach (Car Coming)</h4>
                {fApproach ? (
                  <>
                    <p><b>f_approach:</b> {fApproach.toFixed(2)} Hz</p>
                    <p><b>Time:</b> {timeApproach.toFixed(2)} s</p>
                  </>
                ) : (
                  <p className="car-phase-placeholder">Click Frequency & Velocity button above</p>
                )}
              </div>

              <div className={`car-phase-card ${fRecede ? 'car-phase-recede' : ''}`}>
                <h4 className="car-phase-title-blue">Recede (Car Leaving)</h4>
                {fRecede ? (
                  <>
                    <p><b>f_recede:</b> {fRecede.toFixed(2)} Hz</p>
                    <p><b>Time:</b> {timeRecede.toFixed(2)} s</p>
                  </>
                ) : (
                  <p className="car-phase-placeholder">Click Frequency & Velocity button above</p>
                )}
              </div>
            </div>

            {f0Calculated !== null && velocityCalculated !== null && (
              <div className="car-results-container">
                <h3 className="car-results-title">Calculation Results</h3>

                <div className="car-result-f0">
                  <h4 className="car-result-heading-green">
                    Source Frequency (f₀)
                  </h4>
                  <p className="car-result-value-green">
                    <b>{f0Calculated.toFixed(2)} Hz</b>
                  </p>
                  <p className="car-result-description">
                    Original frequency of the car's sound
                  </p>
                  <p className="car-result-meta">
                    f_approach: {fApproach.toFixed(2)} Hz | f_recede: {fRecede.toFixed(2)} Hz
                  </p>
                  <p className="car-result-meta">
                    Δf: {(fApproach - fRecede).toFixed(2)} Hz
                  </p>
                </div>

                <div className="car-result-velocity">
                  <h4 className="car-result-heading-orange">
                    Car Velocity
                  </h4>
                  <p className="car-result-value-orange">
                    <b>{velocityCalculated.toFixed(2)} m/s</b>
                  </p>
                  <p className="car-result-value-kmh">
                    = <b>{(velocityCalculated * 3.6).toFixed(2)} km/h</b>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="car-backend-section">
            <h4>Backend Calculations (For Comparison):</h4>
            <p>
              <b>Estimated Avg Velocity:</b> {data.estimated_velocity.toFixed(2)} m/s 
              ({(data.estimated_velocity * 3.6).toFixed(2)} km/h)
            </p>
            <p id="liveVel">
              <b>Live Velocity:</b> {currentVelocity} m/s
            </p>
          </div>
        </div>
      ) : (
        <p className="car-no-data">No spectrogram data available. Please upload a file.</p>
      )}
    </div>
  );
}

export default Detect;