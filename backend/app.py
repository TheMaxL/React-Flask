from flask import Flask, jsonify, request, json
from flask_cors import CORS
from fsm import FSM
from flask_sqlalchemy import SQLAlchemy
from stock_utils import get_daily_stock_signal, get_hourly_stock_states, save_stock_states_to_excel, get_last_week_stock_states
import traceback 

app = Flask(__name__)
CORS(app)

fsm = FSM()

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fsm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class FSMRun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    input_series = db.Column(db.String, nullable=False)
    result_trace = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<FSMRun {self.id} | {self.input_series} -> {self.result_trace}>    "

@app.route("/api/fsm", methods=["GET"])
def get_fsm():
    return jsonify(fsm.to_dict())

@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        response = jsonify({"status": "success"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response
    print("Request headers:", request.headers)
    print("Request data:", request.data)
    print("Request form:", request.form)
    print("Request args:", request.args)
    content = request.json
    print("Received:", content)  # DEBUG print

    data = content.get("series")
    
    if not isinstance(data, list) or not all(isinstance(x, int) for x in data):
        return jsonify({"error": "Invalid input. Expecting list of integers."}), 400

    try:
        state_trace = fsm.run(data)
        return jsonify({"trace": state_trace})
    except Exception as e:
        print("Error during FSM run:", e)  # DEBUG print
        return jsonify({"error": "FSM failed to process input"}), 500

@app.route("/api/save", methods=["POST"])
def save_run():
    content = request.json
    input_series = content.get("input_series")
    result_trace = content.get("result_trace")

    if not input_series or not result_trace:
        return jsonify({"error": "Missing input_series or result_trace"}), 400
    try:
        new_run = FSMRun(
            input_series=json.dumps(input_series),
            result_trace=json.dumps(result_trace)
        )
        db.session.add(new_run)
        db.session.commit()
        return jsonify({"status": "success", "id": new_run.id}), 201
    except Exception as e:
        print("Error saving run:", e)
        return jsonify({"error": "Failed to save FSM run"}), 500
    
@app.route("/api/fsmsaved", methods=["GET"])
def get_saved_fsms():
    try:
        runs = FSMRun.query.all()
        result = [{
            "id": run.id,
            "input_series": json.loads(run.input_series),
            "result_trace": json.loads(run.result_trace)
        } for run in runs]
        return jsonify(result), 200
    except Exception as e:
        print("Error fetching saved FSM runs:", e)
        return jsonify({"error": "Failed to fetch saved FSM runs"}), 500

@app.route('/api/stock_state/<ticker>', methods=['GET'])
def stock_state(ticker):
    try:
        print("Received ticker", ticker)
        data = get_last_week_stock_states(ticker)

        # Print the data structure for debugging
        print("Returned data:", data)

        save_stock_states_to_excel(ticker, data)

        if not data:
            return jsonify({'error': f"No valid stock data found for '{ticker}'"}), 400

        # Format data into JSON objects with keys
        formatted_data = [
            {"date": date, "close": close, "state": state} for date, close, state in data
        ]

        return jsonify(formatted_data), 200

    except Exception as e:
        print(f"Error fetching stock state for {ticker}: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/stock_signal/<ticker>')
def stock_signal(ticker):
    signal = get_daily_stock_signal(ticker)
    return jsonify({'signal': signal})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)