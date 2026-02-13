import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import numpy as np
import torch
import torch.nn as nn
from transformers import AutoModel
from safetensors.torch import load_file
from scipy import signal
import pandas as pd

CLASSES = ['NORM', 'MI', 'STTC', 'HYP', 'ASMI', 'LVH', 'ISC_', '2AVB']

# preprocessing
def preprocess_ecg(ecg_signal):
    ecg_signal = ecg_signal[:500, :] 
    ecg_flat = ecg_signal.T.flatten()  # shape: (channels * samples,)
    sos = signal.butter(4, [0.05, 47], btype='band', fs=100, output='sos')
    ecg_filtered = signal.sosfilt(sos, ecg_flat)
    ecg_norm = 2 * (ecg_filtered - np.min(ecg_filtered)) / (np.max(ecg_filtered) - np.min(ecg_filtered)) - 1
    return ecg_norm.astype(np.float32)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Main models upload
model = AutoModel.from_pretrained("Edoardo-BS/hubert-ecg-base", trust_remote_code=True)
model.to(device)

class ECGClassifier(nn.Module):
    def __init__(self, base_model, num_classes=len(CLASSES)):
        super().__init__()
        self.base = base_model
        self.classifier = nn.Linear(base_model.config.hidden_size, num_classes)
    
    def forward(self, input_values, labels=None):
        outputs = self.base(input_values)
        pooled = outputs.last_hidden_state.mean(dim=1)
        logits = self.classifier(pooled)
        loss = None
        if labels is not None:
            loss_fct = nn.CrossEntropyLoss()
            loss = loss_fct(logits.view(-1, self.classifier.out_features), labels.view(-1))
        return {'loss': loss, 'logits': logits} if loss is not None else {'logits': logits}

classifier = ECGClassifier(model)
classifier.to(device)

#upload weights
state_dict = load_file(r"C:\Users\nadah\Downloads\Signal_Viewer-nay_branch\Signal_Viewer-nay_branch\backend\model.safetensors")
classifier.load_state_dict(state_dict)
classifier.eval()


def predict_from_csv(data):
    try:
        import pandas as pd

        if isinstance(data, str):
            df = pd.read_csv(data, header=None)

        elif isinstance(data, pd.DataFrame):
            df = data.copy()
        else:
            raise ValueError("Input must be a file path or a pandas DataFrame")

        df = df.iloc[1:].reset_index(drop=True)

        ecg_signal = df.apply(pd.to_numeric, errors='coerce').values
       
       #processing
        ecg_processed = preprocess_ecg(ecg_signal)

        input_tensor = torch.tensor(ecg_processed, dtype=torch.float32).unsqueeze(0).to(device)

        # prediction
        outputs = classifier(input_tensor)
        pred = torch.argmax(outputs['logits'], dim=1)
        predicted_class = CLASSES[pred.item()]

        return predicted_class

    except Exception as e:
        print(f"Error in predict_from_csv: {e}")
        return None


