# Kaggle Dataset Guide for Solana Trading Bot

## Quick Start: Generate Sample Dataset

If you don't have a dataset yet, generate sample data immediately:

```bash
cd /path/to/project
python ml/generate_sample_dataset.py
```

This creates `ml/data/sample_trading_data.csv` with 1000 synthetic trading samples.

Then train the model:
```bash
python ml/train.py ml/data/sample_trading_data.csv
```

---

## Finding Kaggle Datasets for Trading

### Recommended Datasets

1. **Cryptocurrency Trading Data**
   - URL: https://www.kaggle.com/datasets/jmmoqui/cryptocurrency-data
   - Features: Price, volume, market cap
   - Size: 10+ years of data

2. **Solana Blockchain Data**
   - URL: https://www.kaggle.com/datasets/solend/solana-blockchain-data
   - Features: On-chain metrics, transactions
   - Size: Historical blockchain data

3. **Crypto Market Data**
   - URL: https://www.kaggle.com/datasets/abhisheknayak98/cryptocurrency-market-data
   - Features: OHLCV, moving averages
   - Size: Multi-year historical data

4. **Token Launch Metrics**
   - URL: https://www.kaggle.com/datasets/cryptoswag/token-launch-analysis
   - Features: Launch metrics, holder data
   - Size: 5000+ token launches

5. **Stock Market Data (Transferable)**
   - URL: https://www.kaggle.com/datasets/twiecki/stock-market-data
   - Features: Trading patterns similar to crypto
   - Size: Large historical dataset

### Search Strategy

Visit https://www.kaggle.com/datasets and search for:
- "cryptocurrency trading"
- "bitcoin ethereum data"
- "crypto token data"
- "solana blockchain"
- "defi trading"

---

## Setting Up Kaggle API

### Step 1: Create Kaggle Account
1. Go to https://www.kaggle.com
2. Sign up or log in
3. Go to Settings → Account
4. Scroll to "API" section
5. Click "Create New API Token"
6. This downloads `kaggle.json`

### Step 2: Configure API Access

**On Linux/Mac:**
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

**On Windows:**
```cmd
mkdir %USERPROFILE%\.kaggle
move Downloads\kaggle.json %USERPROFILE%\.kaggle\
```

### Step 3: Install Kaggle CLI
```bash
pip install kaggle
```

### Step 4: Download Dataset

Example - Download cryptocurrency data:
```bash
kaggle datasets download -d jmmoqui/cryptocurrency-data
unzip cryptocurrency-data.zip -d ml/data/
```

---

## Dataset Format Requirements

Your CSV file should have these columns (minimum):

```
volume,liquidity,holders,tx_count,price_change_1m,price_change_5m,volatility,market_cap,dev_activity,label
1000000,50000,500,100,2.5,3.0,45.0,1000000000,75.0,1
500000,25000,250,50,-1.0,0.5,60.0,500000000,40.0,0
2000000,100000,1000,200,5.0,7.5,35.0,2000000000,85.0,1
```

### Feature Definitions

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| **volume** | float | > 0 | Trading volume (base units) |
| **liquidity** | float | > 0 | Pool liquidity in SOL |
| **holders** | int | > 0 | Number of token holders |
| **tx_count** | int | > 0 | Transaction count (1h window) |
| **price_change_1m** | float | any | 1-minute price change % |
| **price_change_5m** | float | any | 5-minute price change % |
| **volatility** | float | 0-100 | Price volatility score |
| **market_cap** | float | > 0 | Market capitalization |
| **dev_activity** | float | 0-100 | Developer activity score |
| **label** | int | 0 or 1 | 1=Profitable, 0=Not Profitable |

---

## Preparing Your Dataset

### Using Python Script

```python
import pandas as pd

# Load your raw data
df = pd.read_csv('your_raw_data.csv')

# Rename columns to match our requirements
df = df.rename(columns={
    'vol': 'volume',
    'liq': 'liquidity',
    'count': 'holders',
    'txs': 'tx_count',
    'change_1': 'price_change_1m',
    'change_5': 'price_change_5m',
    'vol_score': 'volatility',
    'mcap': 'market_cap',
    'dev_score': 'dev_activity',
    'profitable': 'label'
})

# Keep only required columns
required_cols = ['volume', 'liquidity', 'holders', 'tx_count', 
                'price_change_1m', 'price_change_5m', 'volatility',
                'market_cap', 'dev_activity', 'label']
df = df[required_cols]

# Remove rows with missing values
df = df.dropna()

# Save processed data
df.to_csv('ml/data/processed_data.csv', index=False)
```

### Data Validation Script

```bash
# Validate your dataset before training
python ml/validate_dataset.py ml/data/your_dataset.csv
```

---

## Training with Your Dataset

### Step 1: Prepare the data
```bash
python ml/generate_sample_dataset.py  # Or use your own CSV
```

### Step 2: Train the model
```bash
python ml/train.py ml/data/your_dataset.csv --epochs 100 --batch-size 32
```

### Step 3: Monitor training
The script outputs:
- Training/validation loss
- Accuracy metrics
- Model checkpoint location
- Confusion matrix

### Step 4: Use trained model
The model is automatically saved to `ml/models/trading_model.h5`

---

## Dataset Size Recommendations

| Dataset Size | Recommendation | Training Time |
|--------------|---|---|
| 100-500 samples | OK for testing | < 1 minute |
| 500-2000 samples | Good for training | 2-5 minutes |
| 2000-10000 samples | Excellent | 5-15 minutes |
| 10000+ samples | Professional | 15+ minutes |

Start with sample data (1000 samples) to test the pipeline, then expand with real data.

---

## Common Issues & Solutions

### Issue: "CSV file not found"
```bash
# Make sure file exists in correct location
ls -la ml/data/
# Should show your CSV file
```

### Issue: "Missing column" error
```bash
# Check your CSV has all required columns
head ml/data/your_dataset.csv
```

### Issue: "No samples available"
```bash
# Your label column may be empty
# Ensure label column has 0 or 1 values
```

### Issue: "Model not converging"
```bash
# Try different hyperparameters
python ml/train.py ml/data/your_dataset.csv --learning-rate 0.0005 --epochs 150
```

---

## Next Steps

1. **Generate Sample Data:** `python ml/generate_sample_dataset.py`
2. **Train Model:** `python ml/train.py ml/data/sample_trading_data.csv`
3. **Start Bot:** `npm start`
4. **View Dashboard:** http://localhost:3000/dashboard
5. **Replace Dataset:** Swap sample data with real Kaggle dataset when ready

---

## Support

For dataset issues:
- Visit https://www.kaggle.com/datasets to browse datasets
- Check dataset documentation before downloading
- Ensure data format matches requirements
- Run validation before training

For training issues:
- Check `ml/train.py` for hyperparameter tuning
- Review `ml/README.md` for technical details
- Check logs in `logs/training.log`
