import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import json
import sys
from pathlib import Path

class TradePredictionModel:
    """
    Deep Learning model for predicting profitable trades on Solana tokens.
    Uses LSTM layers to process temporal market data.
    """
    
    def __init__(self, model_path=None):
        self.model = None
        self.scaler = MinMaxScaler()
        self.feature_columns = [
            'volume', 'liquidity', 'holder_count', 'tx_count',
            'price_change_1m', 'price_change_5m', 'volatility',
            'market_cap', 'created_timestamp', 'dev_activity'
        ]
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
        else:
            self.build_model()
    
    def build_model(self):
        """Build the LSTM-based neural network for trade prediction"""
        self.model = keras.Sequential([
            keras.layers.LSTM(128, activation='relu', input_shape=(10, len(self.feature_columns)), return_sequences=True),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(64, activation='relu', return_sequences=True),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(32, activation='relu'),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')  # Binary classification: profitable or not
        ])
        
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', keras.metrics.AUC()]
        )
    
    def preprocess_data(self, X):
        """Normalize and reshape data for the LSTM model"""
        X_scaled = self.scaler.fit_transform(X)
        return np.array([X_scaled[i:i+10] for i in range(len(X_scaled)-10)])
    
    def train(self, X_train, y_train, epochs=50, batch_size=32, validation_split=0.2):
        """Train the model on historical trading data"""
        X_processed = self.preprocess_data(X_train)
        
        history = self.model.fit(
            X_processed, y_train[:len(X_processed)],
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def predict(self, X):
        """
        Predict if a trade will be profitable.
        Returns (prediction, confidence)
        """
        X_scaled = self.scaler.transform(X.reshape(1, -1))
        X_reshaped = X_scaled.reshape(1, 1, -1)
        
        prediction = self.model.predict(X_reshaped, verbose=0)[0][0]
        confidence = abs(prediction - 0.5) * 2  # Convert to 0-1 confidence
        
        return {
            'profitable': bool(prediction > 0.5),
            'confidence': float(confidence),
            'probability': float(prediction)
        }
    
    def save_model(self, path):
        """Save trained model and scaler"""
        self.model.save(f"{path}/trade_model.h5")
        joblib.dump(self.scaler, f"{path}/scaler.pkl")
    
    def load_model(self, path):
        """Load trained model and scaler"""
        self.model = keras.models.load_model(f"{path}/trade_model.h5")
        self.scaler = joblib.load(f"{path}/scaler.pkl")


def predict_trade(features_dict):
    """
    API endpoint for making trade predictions.
    
    Expected input:
    {
        "volume": float,
        "liquidity": float,
        "holder_count": int,
        "tx_count": int,
        "price_change_1m": float,
        "price_change_5m": float,
        "volatility": float,
        "market_cap": float,
        "created_timestamp": int,
        "dev_activity": int
    }
    """
    try:
        model = TradePredictionModel(model_path="./ml/models")
        
        feature_order = [
            'volume', 'liquidity', 'holder_count', 'tx_count',
            'price_change_1m', 'price_change_5m', 'volatility',
            'market_cap', 'created_timestamp', 'dev_activity'
        ]
        
        features = np.array([features_dict.get(f, 0) for f in feature_order])
        prediction = model.predict(features)
        
        return prediction
    
    except Exception as e:
        return {"error": str(e), "status": "failed"}


if __name__ == "__main__":
    # CLI interface for model operations
    if len(sys.argv) < 2:
        print("Usage: python model.py <predict|train> [args...]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "predict" and len(sys.argv) > 2:
        features_json = sys.argv[2]
        features_dict = json.loads(features_json)
        result = predict_trade(features_dict)
        print(json.dumps(result))
    
    elif command == "train":
        print("Training model with kaggle dataset...")
        # Training logic would be implemented here
        pass
