import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:500/api',
});

export const getFSM = () => API.get('/fsm');
export const updateFSM = (data) => API.post('/fsm', data);

export function saveFSMRun(input_series, result_trace){
    return fetch("https://localhost:5000/api/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            input_series: inputSeries.join(","), 
            result_trace: resultTrace
        })
    })
        .then(res => res.json())
        .catch(err => {
            console.error("Saved error", err);
            throw err;
        });
}