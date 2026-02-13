import numpy as np
from pathlib import Path
import mne
import joblib
from collections import Counter
import pandas as pd

def predict_patient(test_file):
    """
    Predicts the disease for a single .csv file or DataFrame.
    
    Parameters:
    - test_file: Path to the .csv test file (with Time column) or pandas DataFrame
    - sfreq: Sampling frequency (default 128 Hz)
    - use_filtering: Whether to apply filtering (default True)
    - n_channels: Number of EEG channels (default 19)
    
    Returns:
    - majority_prediction: The predicted disease ('HC', 'AD', 'FTD', 'PD', 'MS')
    """
    model_path = r'C:\Users\nadah\Downloads\Signal_Viewer-nay_branch\Signal_Viewer-nay_branch\backend\multi_band_csp_svm_model2.pkl'
    sfreq=128
    use_filtering=True
    n_channels=19
    
    # model upload 
    try:
        csps, scaler, svm, freq_bands, classes = joblib.load(model_path)
    except Exception as e:
        raise ValueError(f"Error loading model from {model_path}: {e}")
    
    #  data upload
    try:
        if isinstance(test_file, str):
            test_file = Path(test_file)
            if not test_file.exists():
                raise FileNotFoundError(f"File {test_file} does not exist.")
            df = pd.read_csv(test_file)
        elif isinstance(test_file, pd.DataFrame):
            df = test_file.copy()
        else:
            raise ValueError("Input must be a file path or a pandas DataFrame")
    except Exception as e:
        raise ValueError(f"Error loading data: {e}")
    
    expected_columns = ['Time'] + [f'ch{i}' for i in range(n_channels)]
    if not all(col in df.columns for col in expected_columns):
        raise ValueError(f"Input data does not contain expected columns: {expected_columns}")
    
    # without time column
    X_test = df[[f'ch{i}' for i in range(n_channels)]].values.T  # (n_channels, n_times)
    
    n_times = 128  
    if X_test.shape != (n_channels, n_times):
        raise ValueError(f"Invalid data shape: {X_test.shape}, expected ({n_channels}, {n_times})")
    if np.any(np.isnan(X_test)) or np.any(np.isinf(X_test)):
        raise ValueError(f"Input data contains NaN or Inf values")
    
    X_test = X_test.astype(np.float32)[np.newaxis, :, :]  # (1, n_channels, n_times)
    
    # Preprocessing: Multi-band filtering
    info = mne.create_info(ch_names=[f'ch{i}' for i in range(n_channels)], sfreq=sfreq, ch_types='eeg')
    X_test_filtered_bands = []
    for class_name in classes:
        try:
            raw = mne.io.RawArray(X_test[0], info, verbose='ERROR')
            if use_filtering:
                for l_freq, h_freq in freq_bands[class_name]:
                    raw_filtered = raw.copy()
                    raw_filtered.filter(l_freq=l_freq, h_freq=h_freq, method='iir', verbose='ERROR')
                    filtered_data = raw_filtered.get_data()
                    if filtered_data.shape == (n_channels, n_times) and not np.any(np.isnan(filtered_data)) and not np.any(np.isinf(filtered_data)):
                        X_test_filtered_bands.append(filtered_data)
            else:
                filtered_data = raw.get_data()
                if filtered_data.shape == (n_channels, n_times) and not np.any(np.isnan(filtered_data)) and not np.any(np.isinf(filtered_data)):
                    X_test_filtered_bands.append(filtered_data)
        except Exception:
            continue
    
    if len(X_test_filtered_bands) == 0:
        raise ValueError("No valid test epochs after processing.")
    
    X_test_filtered = np.stack(X_test_filtered_bands)
    
    # Normalization
    X_test_mean = np.mean(X_test_filtered, axis=(1, 2), keepdims=True)
    X_test_std = np.std(X_test_filtered, axis=(1, 2), keepdims=True)
    X_test_std = np.where(X_test_std == 0, 1e-8, X_test_std)
    X_test_filtered = (X_test_filtered - X_test_mean) / X_test_std
    
    # Multi-band CSP
    try:
        X_test_csp_all = []
        for band_idx in range(len(csps)):
            csp = csps[band_idx]
            X_test_csp = csp.transform(X_test_filtered)
            X_test_csp_all = np.hstack((X_test_csp_all, X_test_csp)) if len(X_test_csp_all) > 0 else X_test_csp
    except Exception as e:
        raise ValueError(f"Error applying CSP: {e}")
    
    # Scale features
    try:
        X_test_csp_all = scaler.transform(X_test_csp_all)
    except Exception as e:
        raise ValueError(f"Error scaling features: {e}")
    
    # Predict
    try:
        predictions = svm.predict(X_test_csp_all)
        predicted_labels = [classes[pred] for pred in predictions]
        unique, counts = np.unique(predicted_labels, return_counts=True)
        majority_prediction = unique[np.argmax(counts)]
        return majority_prediction
    except Exception as e:
        raise ValueError(f"Error predicting: {e}")