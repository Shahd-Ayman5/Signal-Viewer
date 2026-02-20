
https://github.com/user-attachments/assets/6bf71efb-fc0d-4b47-a98d-b69239d60a28

https://github.com/user-attachments/assets/9ed47174-b575-4e92-bc88-31c1e6c47fbb

https://github.com/user-attachments/assets/93002027-cc96-4e1b-9710-6b24d8d870fe
<img width="1891" height="879" alt="3" src="https://github.com/user-attachments/assets/a25d1809-86cc-484b-a9a1-0aa03edb0d5c" />
https://github.com/user-attachments/assets/03161f73-dec4-4d85-b559-79b2552b1ff7

<div align="center">

# **Multi Signal Viewer with AI detection**

</div>

> ## **Overview**

An integrated web-based application for **multi-domain signal visualization and analysis**, supporting **medical**, **acoustic**, and **radiofrequency** signals.
The viewer integrates multiple AI models and interactive visualization modes for real-time exploration, detection, and classification.

---

## **Included Modules**

#### 🫀 Medical Signals Viewer

- Visualize multi or single-channel `ECG/EEG` signals and detect abnormalities using a pretrained `AI model`.

#### 🔊 Acoustic Signals Viewer

- Vehicle-Passing Doppler Effect: simulate car sounds with controllable `velocity (v)` and `frequency (f)`; estimate both using an AI model from real recordings.
- Drone Detection: detect the presence of drones or submarines among background sounds using an AI classifier.

#### 📡 Radiofrequency Signals Viewer

- Visualize real `SAR` signals and estimate some features.

---
### 🏠 Home Page Preview

Here’s how the main interface of the Signal Viewer looks:

 <img width="1876" height="860" alt="Home Page" src="https://github.com/user-attachments/assets/e1c94f00-cc5b-4147-ac94-7ee80be83e7e" />

---

##  1) Medical Signals Viewer:
### Key features
- Support for multi or single-channel ECG/EEG recordings.

- Automatic abnormality detection.
- Four viewer modes:

  - `Continuous-time viewer` — scrolling viewport with navigate, zoom, and pan controls.

  - `XOR graph` — divide the signal into chunks and overlay them using XOR: identical chunks cancel out.

  - `Polar graph`

  - `Reoccurrence graph` — cumulative scatter plot of channel pairs (chx vs chy) to reveal recurring patterns.
---
## ECG demo:

https://github.com/user-attachments/assets/03161f73-dec4-4d85-b559-79b2552b1ff7

### another abnormal signal: LVH 

<img width="1891" height="879" alt="3" src="https://github.com/user-attachments/assets/a25d1809-86cc-484b-a9a1-0aa03edb0d5c" />

---

## EEG demo:
<img width="1893" height="883" alt="5" src="https://github.com/user-attachments/assets/79403167-0cdc-4b33-b6a7-89b81e778641" />
<img width="1882" height="913" alt="4" src="https://github.com/user-attachments/assets/85e6c190-00d2-43ca-b06d-38e1638409d6" />

---
##  2) Acoustic Signals Viewer:
### 🚗 Doppler Effect Detection
- Uses spectrogram analysis (STFT) to track frequency changes over time and detect peaks:  
  - fₐₚₚ → approaching frequency  
  - fᵣₑc → receding frequency  
- Estimates car speed in m/s or km/h using:  
  v = c × (fₐₚₚ - fᵣₑc) / (fₐₚₚ + fᵣₑc)

https://github.com/user-attachments/assets/93002027-cc96-4e1b-9710-6b24d8d870fe

---

### 🚗 Doppler Car Sound Generator

- This project simulates the Doppler effect by generating the sound of a car passing by with `velocity v` and `horn frequency f`.
- The user can control both parameters, and a spectrogram is displayed to visualize the frequency shift as the car approaches and moves away.


https://github.com/user-attachments/assets/9ed47174-b575-4e92-bc88-31c1e6c47fbb

---

### Drone

This module detects drones from `WAV audio files` using `YAMNet` for feature extraction and a custom classifier, it enables users to upload audio and view predictions

https://github.com/user-attachments/assets/6bf71efb-fc0d-4b47-a98d-b69239d60a28

---
## 3)SAR

<img width="816" height="896" alt="9" src="https://github.com/user-attachments/assets/16097857-d51b-428c-af69-fce9c2d62c34" />
<img width="812" height="507" alt="10" src="https://github.com/user-attachments/assets/39f5aa26-80ca-44e5-bc59-0b51b47d91d4" />

---
   
### Technologies Used

| Layer | Tools & Frameworks | Description | Data / Model Source |
|:------|:-------------------|:-------------|:--------------------|
| **Frontend** | React.js, react-plotly.js | Interactive UI for real-time signal visualization and user controls. | — |
| **Backend** | Flask (Python) | Handles signal processing, AI model inference, and data communication with the frontend. | — |
| **AI / ML Models** | TensorFlow | Pretrained models for abnormality detection (ECG/EEG), Doppler parameter estimation, and sound classification. | [ECG model](https://github.com/Edoar-do/HuBERT-ECG),  [Drone Model](https://github.com/tensorflow/models/tree/master/research/audioset/yamnet), EEG model using `CSP` and `classifier`|
| **Data Formats** | CSV | Supported formats for signal input/output. | [PhysioNet_ecg dataset](https://physionet.org/content/ptb-xl/1.0.3/), [Drones dataset](https://github.com/saraalemadi/DroneAudioDataset), [Car_sound dataset](https://slobodan.ucg.ac.me/science/vse/),EEG_dataset from brainlat |

---

## 👥 Contributors
| [Nayera Sherif](https://github.com/Nayera5) | [Nada Hesham](https://github.com/Nada-Hesham249) | [Shahd Ayman](https://github.com/Shahd-Ayman5) | [Nada Hassan](https://github.com/Nadahassan147) |
|-------------------------------|---------------------------|-----------------------------------|-------------------------------|





---
