# Dashboard Access Guide

## How to Access the Trading Bot Dashboard

After starting the bot, you can access the various dashboards and interfaces:

### 1. Main Dashboard
```
http://localhost:3000
```
- Shows bot status and statistics
- Displays active positions and trading history
- Configuration overview

### 2. Trade Suggestions Dashboard
```
http://localhost:3000/suggestions.html
```
- View pending ML-based trade suggestions
- Accept or reject trade suggestions
- View suggestion history and statistics
- Real-time confidence scores for each trade

### 3. Server Health Check
```
http://localhost:3000/api/health
```
- Returns JSON with server status
- Shows uptime and loaded services
- Useful for monitoring

## Starting the Dashboard Server

### Prerequisites
1. Node.js installed
2. All npm dependencies installed: `npm install`
3. Environment variables configured (see config.js)

### Start the Server

```bash
# Option 1: Run dashboard server separately
node dashboard/server.js

# Option 2: Integrated with bot (if configured)
npm start
```

The dashboard will be available at `http://localhost:3000` (default port)

## Port Configuration

To change the port, set the `DASHBOARD_PORT` environment variable:

```bash
DASHBOARD_PORT=4000 node dashboard/server.js
```

## API Endpoints

### Trade Suggestions
- `GET /api/suggestions/pending` - Get all pending suggestions
- `GET /api/suggestions/:id` - Get specific suggestion
- `POST /api/suggestions/:id/accept` - Accept a suggestion
- `POST /api/suggestions/:id/reject` - Reject a suggestion
- `GET /api/suggestions/stats` - Get suggestion statistics
- `GET /api/suggestions/history` - Get suggestion history

### Trade Execution
- `POST /api/trades/execute/:suggestionId` - Execute trade from suggestion
- `GET /api/trades/history` - Get execution history
- `GET /api/trades/executing` - Get currently executing trades
- `GET /api/trades/stats` - Get trade statistics

### System
- `GET /api/health` - Server health check
- `GET /api/config` - Current bot configuration
- `GET /api/test` - Test endpoint

## Troubleshooting

### Dashboard shows "Endpoint not found"
1. Make sure you're accessing `http://localhost:3000/suggestions.html` (not `/dashboard/public/suggestions.html`)
2. Ensure the server is running: `node dashboard/server.js`
3. Check that port 3000 is not in use (or configure a different port)

### API endpoints returning 500 errors
1. Check the console logs for errors
2. Verify all services are properly initialized
3. Ensure environment variables are set correctly

### Services not loading
Check that all required files exist:
- `/services/tradeSuggestion.js`
- `/services/mlBridge.js`
- `/services/tradeExecutor.js`

## Browser DevTools

For debugging, open the browser's Developer Console (F12):
1. Go to the Console tab
2. Look for `[v0]` prefixed logs which show the API calls
3. Check for network errors in the Network tab

## Development

The dashboard automatically reloads API data every 5 seconds. You can manually refresh by:
- Clicking the refresh button in the UI
- Pressing F5 to reload the page
- Opening the browser console and running API commands directly

Example console command:
```javascript
fetch('/api/suggestions/pending').then(r => r.json()).then(d => console.log(d))
```
