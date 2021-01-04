const express = require('express')
const axios = require('axios');
const app = express()
const port = 3000
const fs = require('fs');
var router = express.Router();

app.use('/api', router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

router.get('/', (req, res) => {
	res.send("Hello from backend!")
})

router.get('/test', (req, res) => {
	res.send("Hello!")
})

router.get('/buses', (req, res) => {
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                {
                    routes(feeds: ["tampere"]) {
                        gtfsId
                        shortName
                        longName
                        mode
                    }
                }       
            `
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        res.send(result.data.data.routes)
    })
    .catch(e => {
	    console.log(e)
    })
})

router.get('/trains', (req, res) => {
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                {
                    rTrain: routes(transportModes: RAIL, name: "R") {
                        gtfsId
                        shortName
                        mode
                        bikesAllowed
                        gtfsId
                        agency {
                            id
                            name
                        }
                    }
                    mTrain: routes(transportModes: RAIL, name: "M") {
                        gtfsId
                        shortName
                        mode
                        bikesAllowed
                        gtfsId
                        agency {
                            id
                            name
                        }
                    }
                }     
            `
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        let result = response.data.data.mTrain.concat(response.data.data.rTrain)
        let tmp = []
        result.forEach(route => {
            if (!tmp.find(x => x.shortName == route.shortName)) {
                tmp.push(route)
            }
        })
        res.send(tmp)
    })
    .catch(e => {
	    console.log(e)
    })
})

router.get('/linedata', (req, res) => {
    console.log(req.query.name)
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                query Routes($name: String, $feeds: [String]) {
                    routes(name: $name, feeds: $feeds) {
                        shortName
                        longName
                        patterns {
                            code
                            headsign
                            directionId
                            stops {
                                name
                                wheelchairBoarding
                                vehicleMode
                                zoneId
                                direction
                                gtfsId
                                stoptimesWithoutPatterns(omitNonPickups: true) {
                                    scheduledArrival
                                    realtimeArrival
                                    arrivalDelay
                                    scheduledDeparture
                                    realtimeDeparture
                                    departureDelay
                                    timepoint
                                    realtimeDeparture
                                    realtimeState
                                    pickupType
                                    dropoffType
                                    serviceDay
                                    headsign
                                  trip {
                                    id
                                    gtfsId
                                    tripHeadsign
                                    tripShortName
                                    bikesAllowed
                                    wheelchairAccessible
                                    pattern {
                                      id
                                      code
                                    }
                                  }
                                }
                            }
                        }
                    }
                }       
            `,
            variables: {
                name: req.query.name,
                feeds: ["tampere"]
            }
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        const applicableRoutes = result.data.data.routes.filter(x => x.shortName == req.query.name)
        res.send(applicableRoutes)
    })
    .catch(e => {
	    res.status(500).send(e)
    })
})

router.get('/traindata', (req, res) => {
    let orderPromise = axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                query Routes($name: String) {
                    routes(name: $name) {
                        shortName
                        longName
                        stops {
                            gtfsId
                            name
                        }
                    }
                }       
            `,
            variables: {
                name: req.query.name
            }
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        const filteredRoutes = result.data.data.routes.filter(x => x.shortName === req.query.name)
        const sortedRoutes = filteredRoutes.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return b.stops.length - a.stops.length;
        });
        const orderArray = sortedRoutes.length > 0 ?  sortedRoutes[0].stops : []
        return {orderArray: orderArray}
    })
    let dataPromise = axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                query Routes($name: String) {
                    routes(name: $name) {
                        shortName
                        longName
                        patterns {
                            code
                            headsign
                            directionId
                            stops {
                                name
                                wheelchairBoarding
                                vehicleMode
                                zoneId
                                direction
                                gtfsId
                                stoptimesWithoutPatterns(omitNonPickups: true, numberOfDepartures: 30) {
                                    scheduledArrival
                                    realtimeArrival
                                    arrivalDelay
                                    scheduledDeparture
                                    realtimeDeparture
                                    departureDelay
                                    timepoint
                                    realtimeDeparture
                                    realtimeState
                                    pickupType
                                    dropoffType
                                    serviceDay
                                    headsign
                                  trip {
                                    id
                                    gtfsId
                                    tripHeadsign
                                    tripShortName
                                    bikesAllowed
                                    wheelchairAccessible
                                    pattern {
                                      id
                                      code
                                    }
                                  }
                                }
                            }
                        }
                    }
                }       
            `,
            variables: {
                name: req.query.name
            }
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        return result.data.data.routes.filter(x => x.shortName === req.query.name)
    })

    Promise.all([dataPromise, orderPromise]).then(response => {
        const order = response.find(x => x.orderArray).orderArray.map(x => x.gtfsId)
        const data = response.find(x => !x.orderArray)
        data.forEach(route => {
            for (let i = 0; i < route.patterns.length; i++) {
                if (route.patterns[i].stops.length > 1) {
                    const firstStop = route.patterns[i].stops[0]
                    const secondStop = route.patterns[i].stops[1]
                    const firstStopIndex = order.findIndex(x => x === firstStop.gtfsId)
                    const secondStopIndex = order.findIndex(x => x === secondStop.gtfsId)
                    route.patterns[i].directionId = firstStopIndex > secondStopIndex ? 1 : 0
                }
            }
        })
        res.send(data)
    })
    .catch(e => {
        console.log(e)
    })
})

router.get('/nearest', (req, res) => {
    let qq = `{
        stopsByRadius(lat: ` + req.query.lat + `, lon: ` + req.query.lon + `, radius: 1500) {
          edges {
            node {
              stop { 
                gtfsId 
                name
                zoneId
                vehicleMode
                wheelchairBoarding
                routes {
                  shortName
                }
              }
              distance
            }
          }
        }
      }}`
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            "query": qq
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        res.send(result.data.data.stopsByRadius.edges)
    })
    .catch(e => {
    	res.status(500).send(e)
    })
})

router.get('/stoptimes', (req, res) => {
    let qq = `{
        stop(id: "` + req.query.id + `") {
            name
            wheelchairBoarding
            stoptimesWithoutPatterns(numberOfDepartures: 10) {
              scheduledArrival
              realtimeArrival
              arrivalDelay
              scheduledDeparture
              realtimeDeparture
              departureDelay
              timepoint
              realtime
              realtimeState
              pickupType
              dropoffType
              serviceDay
              headsign
              stopSequence
              trip {
                id
                routeShortName
              }
            }
          }
    }`
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            "query": qq
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        res.send(result.data.data.stop.stoptimesWithoutPatterns)
    })
    .catch(e => {
    	res.status(500).send(e)
    })
})

router.get('/patternstops', (req, res) => {
    console.log("get patternstop")
    console.log(req.query.id)
	axios({
        url: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
        method: 'post',
        data: {
            query: `
                query Route($id: String) {
                    pattern(id: $id) {
                        name
                    }
                }
            `,
            variables: {
                id: req.query.id
            }
        },
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((result) => {
        res.send(result.data.data.pattern)
    })
    .catch(e => {
    	res.status(500).send(e)
    })
})