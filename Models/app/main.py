from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from keras.models import load_model
import uvicorn
import joblib
import os

# Load the model (directory-based Keras 3 format)
# Absolute or relative path based on where main.py is
model_path = os.path.join(os.path.dirname(__file__), "../model/best_model.keras")
model_path = os.path.abspath(model_path)

model = load_model(model_path)

# Define input shape and preprocessing manually (should match training)
SEQUENCE_LENGTH = 7  # number of time steps
NUM_FEATURES = 6     # number of features used per time step (cash_in, cash_out, etc.)

app = FastAPI()

class ForecastRequest(BaseModel):
    sequence: list[list[float]]  # shape: [7][6]

# Load scalers
model_path = os.path.join(os.path.dirname(__file__), "../model/scaler_X.pkl")
model_path = os.path.abspath(model_path)
scaler_X = joblib.load(model_path)
model_path = os.path.join(os.path.dirname(__file__), "../model/scaler_y.pkl")
model_path = os.path.abspath(model_path)
scaler_y = joblib.load(model_path)

@app.post("/predict")
def predict_cashflow(data: ForecastRequest):
    try:
        print(data.sequence)
        raw_sequence = np.array(data.sequence)
        if raw_sequence.shape != (7, 6):
            return {"error": f"Expected input shape (7, 6), got {raw_sequence.shape}"}

        # Scale input
        scaled_sequence = scaler_X.transform(raw_sequence)
        scaled_sequence = np.expand_dims(scaled_sequence, axis=0)  # shape: (1, 7, 6)

        # Predict
        y_pred_scaled = model.predict(scaled_sequence)
        y_pred = scaler_y.inverse_transform(y_pred_scaled)

        print("Predicted scaled cash flow:", y_pred_scaled)
        print("Predicted cash flow:", y_pred)

        return {"predicted_net_cashflow": float(y_pred[0][0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/")
def read_root():
    return {"message": "Welcome to the Cash Flow Prediction API. Use POST /predict with a valid sequence."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8060, reload=True)
