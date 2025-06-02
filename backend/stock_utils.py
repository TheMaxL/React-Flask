import yfinance as yf
import pandas as pd
import os
import datetime
import traceback

def save_stock_states_to_excel(ticker, signals):
    """Save FSM signals to Excel file with enhanced error handling"""
    print("save_stock_states_to_excel called")
    try:
        cwd = os.getcwd()
        print(f"Current working directory: {cwd}")
        
        # Create DataFrame with date index if available
        if signals and isinstance(signals[0], tuple) and len(signals[0]) == 2:
            df = pd.DataFrame(signals, columns=["Date", "Signal"])
        else:
            df = pd.DataFrame({"Signal": signals})
            
        filename = os.path.join(cwd, f"{ticker}_stock_signals.xlsx")
        df.to_excel(filename, index=False)
        print(f"Successfully saved signals to {filename}")
        return True
    except Exception as e:
        print(f"Error saving Excel file: {str(e)}")
        traceback.print_exc()
        return False

def get_last_week_stock_states(ticker):
    """Fetch and process stock data with robust error handling"""
    try:
        print(f"\nFetching data for {ticker}...")
        
        # Fetch data with timeout and error handling
        df = yf.download(
            tickers=ticker,
            period="7d",
            interval="1d",
            progress=False,
            timeout=10
        )
        
        if df.empty:
            print(f"No data returned for {ticker}")
            return []
            
        print("\nRaw DataFrame:")
        print(df.head())
        print("\nColumns:", df.columns)
        
        # Handle multi-index columns
        if isinstance(df.columns, pd.MultiIndex):
            if ('Close', ticker) in df.columns:
                close_prices = df[('Close', ticker)]
            else:
                close_prices = df.xs('Close', axis=1, level=0).iloc[:, 0]
        else:
            close_prices = df['Close']
            
        print("\nClose prices:")
        print(close_prices)
        
        # Validate data length
        if len(close_prices) < 2:
            print(f"Not enough data points (need at least 2, got {len(close_prices)})")
            return []
            
        # Calculate daily changes and generate signals
        signals = []
        result = []
        for i in range(1, len(close_prices)):
            try:
                date = str(close_prices.index[i].date())
                prev_price = close_prices.iloc[i-1]
                curr_price = close_prices.iloc[i]
                percent_change = ((curr_price - prev_price) / prev_price) * 100
                
                # Generate signal (0=Growth, 1=Sideways, 2=Decline)
                if percent_change > 3:
                    signal = 0
                elif percent_change < -3:
                    signal = 2
                else:
                    signal = 1
                    
                result.append((date, percent_change))
                signals.append(signal)
                
                print(f"Day {i}: {date} | Change: {percent_change:.2f}% | Signal: {signal}")
                
            except Exception as e:
                print(f"Error processing day {i}: {str(e)}")
                continue
                
        print(f"\nFinal signals: {signals}")
        return signals if len(result) == 0 else result
        
    except Exception as e:
        print(f"Error in get_last_week_stock_states: {str(e)}")
        traceback.print_exc()
        return []