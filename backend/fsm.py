class FSM:
    def __init__(self):
        self.states = ["A", "B", "C", "D", "E"]
        self.transitions = {
            "D": {0: "A", 1: "D", 2: "C"},
            "A": {0: "A", 1: "D"},
            "D": {0: "D", 1: "D", 2: "C"},
            "C": {0: "D", 1: "E", 2: "E"},
            "E": {0: "C", 1: "E", 2: "E"},
        }
        self.current_state = "D"

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
