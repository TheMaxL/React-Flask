class FSM:
    def __init__(self):
        self.states = ["Growth", "Correction", "Downtrend", "Sideways", "Decline"]
        self.transitions = {
            "Sideways": {0: "Growth", 1: "Correction", 2: "Downtrend"},
            "Growth": {0: "Growth"},
            "Correction": {0: "Correction", 1: "Correction", 2: "Downtrend"},
            "Downtrend": {0: "Correction", 1: "Decline", 2: "Decline"},
            "Decline": {0: "Decline", 1: "Decline", 2: "Decline"},
        }
        self.current_state = "Sideways"

    def run(self, input_series):
        state_trace = []
        state = self.current_state
        for signal in input_series:
            state = self.transitions.get(state, {}).get(signal, state)
            state_trace.append(state)
        return state_trace

    def to_dict(self):
        return {
            "states": self.states,
            "transitions": self.transitions,
            "current": self.current_state
        }

    def update(self, data):
        self.transitions = data.get("transitions", self.transitions)
