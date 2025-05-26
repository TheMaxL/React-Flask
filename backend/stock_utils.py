import yfinance as yf
import pandas as pd 
import os
import datetime

def get_daily_stock_signal(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="2d", interval="1d")

    if len(hist) < 2:
        return None 
    
    latest_close = hist['Close'].iloc[-1]
    previous_close = hist['Close'].iloc[-2]

    percent_change = ((latest_close - previous_close) / previous_close) * 100

    if percent_change < -2:
        return 0
    elif -2 <= percent_change <= 2:
        return 1
    else:
        return 2

def get_hourly_stock_states(ticker):
    now = datetime.datetime.now()
    one_hour_ago = now - datetime.timedelta(hours=1)

    df = yf.download(tickers=ticker, period="1d", interval="1m", progress=False)
    df = df[df.index >= one_hour_ago]

    if df.empty:
        return []

    states = []
    prev_close = None

    for time, row in df.iterrows():
        price = row['Close']

        if prev_close is None:
            state = 1
        else:
            percent_change = ((price - prev_close) / prev_close) * 100

            if percent_change < -2:
                state = 0
            elif percent_change > 2:
                state = 2
            else:
                state = 1

        states.append([time.strftime("%H:%M"), state])
        prev_close = price

    return states

def save_stock_states_to_excel(ticker, data):
    print("save_stock_states_to_excel called")
    try:
        cwd = os.getcwd()
        print(f"Current working directory: {cwd}")
        df = pd.DataFrame(data)
        filename = os.path.join(cwd, f"{ticker}_hourly_stock_states.xlsx")
        df.to_excel(filename, index=False)
        print(f"Saved Excel file as {filename}")
    except Exception as e:
        print(f"Error saving Excel file: {e}")

def get_last_week_stock_states(ticker):
    try:
        # 7 days back, daily intervals
        df = yf.download(tickers=ticker, period="7d", interval="1d")
        if df.empty:
            print(f"No daily data returned for {ticker}")
            return []

        result = [(str(index.date()), float(row['Close'])) for index, row in df.iterrows()]
        return result

    except Exception as e:
        print(f"Error fetching daily stock data for {ticker}: {e}")
        return []