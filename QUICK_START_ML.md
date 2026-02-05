# Quick Start: ML Trading Bot with Dataset

## Option 1: Use Sample Dataset (Fastest - 2 minutes)

### Step 1: Generate Sample Data
```bash
cd /path/to/project
python ml/generate_sample_dataset.py
```

Output:
```
✓ Sample dataset generated: ml/data/sample_trading_data.csv
✓ Total samples: 1000
✓ Profitable trades (label=1): 523 (52.3%)
✓ Non-profitable trades (label=0): 477 (47.7%)
```

### Step 2: Train the Model
```bash
python ml/train.py ml/data/sample_trading_data.csv
```

Training will take 2-5 minutes and output:
```
Epoch 1/50: Loss: 0.6234, Accuracy: 0.6145
Epoch 2/50: Loss: 0.5891, Accuracy: 0.6723
...
Epoch 50/50: Loss: 0.3421, Accuracy: 0.8234

✓ Model trained successfully!
✓ Saved to: ml/models/trading_model.h5
```

### Step 3: Run the Bot
```bash
npm start
```

The bot is ready! It will use the ML model to suggest trades.

---

## Option 2: Use Real Kaggle Dataset (10 minutes)

### Step 1: Download from Kaggle

**Install Kaggle CLI:**
```bash
pip install kaggle
```

**Configure Kaggle API:**
- Go to https://www.kaggle.com/settings/account
- Click "Create New API Token"
- Save the file to `~/.kaggle/kaggle.json`

**Download Dataset:**
```bash
# Example: Download cryptocurrency data
kaggle datasets download -d jmmoqui/cryptocurrency-data
unzip cryptocurrency-data.zip -d ml/data/
```

### Step 2: Prepare Your Data

Ensure your CSV has these columns:
```
volume, liquidity, holders, tx_count, price_change_1m, 
price_change_5m, volatility, market_cap, dev_activity, label
```

If your data has different column names, rename them:
```python
import pandas as pd

df = pd.read_csv('ml/data/your_data.csv')
df = df.rename(columns={
    'trading_volume': 'volume',
    'pool_liquidity': 'liquidity',
    # ... map your columns to our names
})
df.to_csv('ml/data/your_data.csv', index=False)
```

### Step 3: Validate Dataset
```bash
python ml/validate_dataset.py ml/data/your_data.csv
```

Should output:
```
✓ All required columns present
✓ No missing values
✓ Dataset validation PASSED!
```

### Step 4: Train Model
```bash
python ml/train.py ml/data/your_data.csv
```

### Step 5: Run Bot
```bash
npm start
```

---

## What Happens When Bot Runs

1. **Token Launch Detected** → New Solana token launches
2. **ML Prediction** → Model analyzes 9 trading features
3. **Suggestion Generated** → Shows confidence score (0-100%)
4. **User Decision** → Accept (execute trade) or Reject (skip)
5. **Trade Executed** → If accepted, bot places trade

---

## Dashboard Access

Once bot is running:

```
http://localhost:3000/dashboard
```

Features:
- View pending trade suggestions
- Accept/reject trades with one click
- See ML confidence scores
- View trading statistics
- Monitor execution history

---

## File Structure

```
solana-copy-trading-grpc/
├── ml/
│   ├── model.py                    # LSTM neural network
│   ├── dataset_loader.py           # Data preprocessing
│   ├── train.py                    # Training script
│   ├── generate_sample_dataset.py  # Dataset generator
│   ├── validate_dataset.py         # Validation script
│   ├── requirements.txt            # Python dependencies
│   ├── data/
│   │   ├── sample_trading_data.csv # Sample dataset
│   │   └── dataset_template.csv    # Format template
│   └── models/
│       └── trading_model.h5        # Trained model (created after training)
├── services/
│   ├── tradeSuggestion.js          # Suggestion management
│   ├── mlBridge.js                 # ML-Node bridge
│   └── tradeExecutor.js            # Trade execution
├── main.js                          # Bot entry point
└── KAGGLE_DATASET_GUIDE.md         # Detailed guide
```

---

## Troubleshooting

### "Python not found"
```bash
python3 ml/generate_sample_dataset.py
```

### "Module not found" error
```bash
pip install -r ml/requirements.txt
```

### "CSV not found"
```bash
# Make sure file exists
ls -la ml/data/
```

### "Model training failed"
```bash
# Validate your dataset first
python ml/validate_dataset.py ml/data/your_data.csv
```

---

## Next Steps

1. ✅ Generate sample dataset
2. ✅ Train model (2-5 minutes)
3. ✅ Run bot (`npm start`)
4. ✅ Access dashboard
5. ✅ Accept/reject suggestions
6. 📈 Replace with real Kaggle dataset for production

---

## Common Kaggle Datasets

| Dataset | Size | Features |
|---------|------|----------|
| Cryptocurrency Data | 10 years | Price, volume, market cap |
| Solana Blockchain | Historical | On-chain metrics |
| Crypto Market | Multi-year | OHLCV, moving averages |
| Token Launch | 5000+ | Launch metrics |

More: https://www.kaggle.com/datasets?search=cryptocurrency

---

## Key Commands

```bash
# Generate sample data
python ml/generate_sample_dataset.py

# Validate dataset
python ml/validate_dataset.py ml/data/your_data.csv

# Train model
python ml/train.py ml/data/sample_trading_data.csv

# Train with custom parameters
python ml/train.py ml/data/sample_trading_data.csv --epochs 100 --batch-size 32

# Start bot
npm start

# View dashboard
# Open http://localhost:3000/dashboard in browser
```

You're ready to go! 🚀
