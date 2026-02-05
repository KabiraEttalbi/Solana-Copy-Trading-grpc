# Dashboard Quick Start

## Getting Started in 30 Seconds

### 1. Start the Bot
```bash
npm start
```

You should see:
```
Dashboard server started on port 3000
Access dashboard at: http://localhost:3000
```

### 2. Open Dashboard
Click the link or navigate to:
```
http://localhost:3000
```

### 3. View Trade Suggestions
Click "Trade Suggestions" button or go to:
```
http://localhost:3000/suggestions.html
```

## What You'll See

### Main Dashboard (http://localhost:3000)
- Bot status and uptime
- Active positions count
- Daily PnL
- Win rate and risk level
- Charts and trading history
- Configuration settings
- Emergency close button for all positions

### Suggestions Dashboard (http://localhost:3000/suggestions.html)
- **Pending Suggestions** - ML model predictions awaiting approval
- **Accepted Trades** - Suggestions you've accepted
- **Rejected Trades** - Suggestions you've rejected
- **Statistics** - Accuracy, confidence levels, success rates

## Using Trade Suggestions

### Accept a Trade
1. Go to "Pending Suggestions" tab
2. Review the suggestion details:
   - Token symbol and address
   - ML confidence score (0-100%)
   - Predicted profit margin
   - Risk assessment
3. Click "Accept" to execute the trade
4. Trade will be placed immediately

### Reject a Trade
1. Click "Reject" to skip the suggestion
2. Optionally add a reason
3. Suggestion moves to "Rejected" tab

### Statistics
The "Statistics" tab shows:
- Total suggestions generated
- Acceptance rate
- Success rate of accepted trades
- Average confidence of accepted trades
- Profit/loss from suggested trades

## Troubleshooting

### Dashboard Not Loading?

**Issue:** "Endpoint not found" error
- **Solution:** Make sure you're accessing `http://localhost:3000` not `http://localhost:3000/dashboard/public`
- **Solution:** Check the console logs, dashboard server should print startup message

**Issue:** API returning 500 errors
- **Solution:** Check browser console (F12) for detailed error logs
- **Solution:** Verify services are loaded: Go to `http://localhost:3000/api/health`

**Issue:** Can't connect to server
- **Solution:** Verify port 3000 is not in use: `lsof -i :3000`
- **Solution:** Use a different port: `DASHBOARD_PORT=4000 npm start`

### Disable Dashboard
If you don't want the dashboard running:
```bash
DISABLE_DASHBOARD=true npm start
```

## API Testing

Test the API directly in browser console:

```javascript
// Check server health
fetch('/api/health').then(r => r.json()).then(console.log)

// Get pending suggestions
fetch('/api/suggestions/pending').then(r => r.json()).then(console.log)

// Accept a suggestion (replace ID with real one)
fetch('/api/suggestions/abc123/accept', {method: 'POST'})
  .then(r => r.json()).then(console.log)

// Get trading statistics
fetch('/api/trades/stats').then(r => r.json()).then(console.log)
```

## Advanced

### Port Configuration
```bash
DASHBOARD_PORT=8080 npm start
```

### Monitoring Real-Time Data
Open browser DevTools Console (F12) to see:
- `[v0]` prefixed logs showing all API calls
- Real-time error messages
- Data being sent and received

### Rate Limiting
Default: 60 requests per minute per IP
This prevents abuse and protects your API.

## Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check server logs in terminal
3. Verify all services initialized: `/api/health`
4. Ensure config.js has all required settings
