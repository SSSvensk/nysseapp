<template>
    <v-card class="elevation-0 card" @click="getStopTimes(data.stop.gtfsId)">
        <v-card-title>
            <div class="zoneF text-center">
                {{data.stop.zoneId}}
            </div>
                <v-icon>{{ data.stop.vehicleMode == "BUS" ? 'mdi-bus' : 'mdi-train' }}</v-icon>
                {{ data.stop.name}}
                <v-spacer />
                {{ data.distance}} m
            </v-card-title>
            <v-card-text>
                <div class="row">
                    <div v-for="(route, index) in data.stop.routes" v-bind:key="index" class="route text-center pa-1 mb-1">
                        {{route.shortName}}
                    </div>
                </div>
                <div v-if="open">
                    <div v-if="!loading">
                        <table>
                            <tr>
                                <td>Linja</td>
                                <td>Määränpää</td>
                                <td>Lähtö-aika (aikataulu)</td>
                                <td>Lähtö-aika (arvioitu)</td>
                            </tr>
                            <tr v-for="(stoptime, index) in stoptimes" v-bind:key="'st-' + index">
                                <td>{{stoptime.trip.routeShortName}}</td>
                                <td>{{stoptime.headsign}}</td>
                                <td>{{ getDepartureTime(stoptime.scheduledDeparture) }}</td>
                                <td><b>{{ getDepartureTime(stoptime.realtimeDeparture) }}</b></td>
                            </tr>
                        </table>
                    </div>
                    <div v-else>
                        Ladataan
                    </div>
                </div>
        </v-card-text>
    </v-card>
</template>
<script>
import api from "@/api/api.js"
export default {
    name: "Nearest",
    props: {
        data: Object
    },
    data() {
        return {
            loading: false,
            loaded: false,
            open: false,
            stoptimes: []
        }
    },
    methods: {
        getStopTimes(id) {
            this.open = true
            this.loading = true
            console.log(id)
            api.getStopTimesForStop(id).then(response => {
                console.log(response)
                this.stoptimes = response.data
            })
            .finally(() => {
                this.loading = false
                this.loaded = true
            })
        },
        getDepartureTime(seconds) {
            if (seconds && seconds > 0) {
                let hours = Math.floor(seconds / 3600)
                let minutes = Math.floor((seconds / 60) - (hours * 60))
                if (minutes < 10) {
                    minutes = "0" + minutes
                }
                let time = hours + ":" + minutes
                return time
            }
            return ""
        },
    }
}
</script>
<style scoped>
.row {
  width: 100%;
  margin: 0 auto;
  display: flex; /* for centering 3 blocks in the center */
  /* justify-content: space-between; for space in between */ 
}
.route {
  min-width: 30px;
  margin-right: 10px;
  background-color: blue;
  color: white;
  justify-content: center;
}
.zoneA {
  color: palevioletred;
  border: 1px solid palevioletred;
  min-width: 30px;
  background-color: white;
}
.zoneB {
  color: white;
  border: 1px solid white;
  min-width: 30px;
  background-color: palevioletred;
}
.zoneC {
  color: white;
  border: 1px solid white;
  min-width: 30px;
  background-color: teal;
}
.zoneD {
  color: white;
  border: 1px solid white;
  min-width: 30px;
  background-color: rgb(84, 70, 136);
}
.zoneE {
  color: white;
  border: 1px solid white;
  min-width: 30px;
  background-color:green;
}
.zoneF {
  color: white;
  border: 1px solid white;
  min-width: 30px;
  background-color: gray;
}
.card:hover {
  background-color: rgb(223, 219, 219);
}
</style>
