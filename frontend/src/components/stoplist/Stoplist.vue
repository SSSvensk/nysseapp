<template>
<div>
    <v-container class="home" v-if="!loadingError && !loading">
        <v-row>
            <v-col>
                <v-card outlined class="elevation-0 pa-2">
                    <v-card-title class="pa-0">
                        <div class="text-center font-weight-bold" v-bind:class="{ 'busbox' : transportationType == 'bus', 'trainbox' : transportationType == 'train'}">
                            {{ line }}
                        </div>
                        <div class="ml-3">
                            <h2 class="font-weight-light">{{ headsign }}</h2>
                        </div>
                        <v-spacer />
                        <v-icon>{{ 'mdi-' + transportationType }}</v-icon>
                    </v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-timeline align-top dense>
                <v-timeline-item
                    v-for="(stop, i) in stops"
                    :key="i"
                    :color="transportationType == 'bus' ? 'primary' : transportationType == 'train' ? 'green' : 'red'"
                    small
                    :fill-dot="transportationType == 'bus' ? true : false"
                >
                    <template v-slot:icon>
                        <span class="white--text">{{stop.zoneId}}</span>
                    </template>
                   <div>
                        <h3>
                            {{ stop.name }}
                        </h3>
                        <div>
                            <table>
                                <tr v-for="(stoptime, index) in stop.stoptimes" v-bind:key="index">
                                    <td class="pr-4">
                                        {{ new Date().toLocaleDateString('fi') == new Date(stoptime.serviceDay * 1000).toLocaleDateString('fi') ?
                                        getTimeToNextStop(stoptime) : new Date(stoptime.serviceDay * 1000).toLocaleDateString('fi') }}
                                    </td>
                                    <td class="pr-4">{{ getStopTime(stoptime) }}</td>
                                    <td class="pr-2">{{stoptime.headsign}}</td>
                                    <td>
                                        <v-icon v-if="stoptime.realtimeState === 'UPDATED'">mdi-radar</v-icon>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </v-timeline-item>
            </v-timeline>
        </v-row>
    </v-container>
    <v-container v-else-if="loading" class="text-center">
        <v-progress-circular
            indeterminate
            color="primary"
        ></v-progress-circular>
    </v-container>
    <v-container v-else-if="loadingError">
        <v-alert color="red">
            Virhe latauksessa
        </v-alert>
    </v-container>
</div>
</template>
<script>

export default {
    name: 'StopList',
    props: {
        patterns: Array,
        line: String,
        transportationType: String,
        headsign: String
    },
    data() {
        return {
            loading: false,
            loadingError: false,
            lineName: null,
            stops: [],
            fullname: null
        }
    },
    watch: {
        patterns() {
            this.getPatternStops()
        }
    },
    mounted() {
        this.getPatternStops()
    },
    methods: {
        getPatternStops() {
            console.log(this.patterns)
            const arr = JSON.parse(JSON.stringify(this.patterns))
            const orderedArr = arr.sort(function(a, b){
                // ASC  -> a.length - b.length
                // DESC -> b.length - a.length
                return b.stops.length - a.stops.length;
            });
            const patternIds = this.patterns.map(x => x.code)
            this.stops = orderedArr[0].stops
            this.stops.forEach(element => {
                let stoptimes = []
                this.patterns.forEach(pattern => {
                    pattern.stops.forEach(stop => {
                        if (stop.gtfsId == element.gtfsId) {
                            stop.stoptimesWithoutPatterns.forEach(stoptime => {
                                if (patternIds.find(x => x == stoptime.trip.pattern.code)) {
                                    if (!stoptimes.find(x => x.trip.id == stoptime.trip.id)) {
                                        stoptimes.push(stoptime)
                                    }
                                    
                                }
                            })
                        }
                    })
                })
                element.stoptimes = stoptimes
            });
        },
        getStopTime(c) {
            const seconds = c.realtimeArrival
            const hours = parseInt(seconds / 3600)
            const remainingSeconds = seconds - (hours*3600)
            const minutes = parseInt(remainingSeconds / 60)
            return hours + ":" + (minutes < 10 ? ("0" + minutes) : minutes)
        },
        getTimeToNextStop(c) {
            const stopArrival = c.realtimeArrival
            const minutesNow = new Date().getMinutes()
            const hoursNow = new Date().getHours()
            const secondsNow = (hoursNow * 60 * 60) + (minutesNow * 60)
            const secondsDiff = parseInt(stopArrival - secondsNow)
            return parseInt(secondsDiff / 60) + " min"
        }
    }
}
</script>
<style scoped>
.busbox {
    color: white;
    min-width: 30px;
    background-color: blue;
}
.trainbox {
    color: white;
    min-width: 30px;
    background-color: green;
}
</style>
