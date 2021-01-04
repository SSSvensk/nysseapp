import axios from "axios"

const AXIOS = axios.create({
  baseURL: `/api`,
  timeout: 10000
});

export default {
    getBuses() {
        return AXIOS.get('/buses')
    },
    getNearest(paramLat, paramLon) {
        return AXIOS.get('/nearest', {
            params: {
                lat: paramLat,
                lon: paramLon
            }
        })
    },
    getStopTimesForStop(paramId) {
        console.log(paramId)
        return AXIOS.get('/stoptimes', {
            params: {
                id: paramId
            }
        })
    },
    getTrains() {
        return AXIOS.get('/trains')
    },
    getPatterns(paramName, transportType) {
        let endPoint = ""
        if (transportType === "train") {
            endPoint = "/traindata"
        } else if (transportType === "bus") {
            endPoint = "/linedata"
        } else {
            return Promise.resolve()
        }

        return AXIOS.get(endPoint, {
            params: {
                name: paramName
            }
        })
        
    },
    getPatternStops(paramName) {
        return AXIOS.get('/patternstops', {
            params: {
                id: paramName
            }
        })
    }
}
