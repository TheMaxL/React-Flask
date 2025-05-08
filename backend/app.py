from flask import Flask, jsonify, request
from flask_cors import CORS
from fsm import FSM

app = Flask(__name__)
CORS(app)

fsm = FSM()

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


if __name__ == "__main__":
    app.run(debug=True, port=5000)