<template>
  <v-container class="about">
    <v-row>
      <v-col>
        <h2>Lähimmät pysäkit</h2></v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-icon>mdi-radar</v-icon>
        {{lat}}, {{lon}}
      </v-col>
    </v-row>
    <v-row>
      <v-col>Modes of transport</v-col>
    </v-row>
    <v-row>
      <v-col>
        <div v-for="(stop, index) in stops" v-bind:key="index">
          <Stop :data="stop.node"></Stop>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import api from "@/api/api.js"
import Stop from "@/components/nearestpage/Stop"
export default {
  name: "Nearest",
  components: {
    Stop
  },
  data() {
    return {
      lat: 0,
      lon: 0,
      stops: []
    }
  },
  watch: {
    lat() {
      this.getNearestStops()
    }
  },
  mounted() {
    this.getLocation()
  },
  methods: {
    getLocation() {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude
        this.lon = position.coords.longitude
      },
      error => {
        console.log(error.message);
      })  
    },
    getNearestStops() {
      if (this.lat && this.lon > 0) {
        api.getNearest(this.lat, this.lon).then(response => {
          console.log(response)
          this.stops = response.data
        })
      }
      
    },
    getStopTimes(id) {
      console.log(id)
      api.getStopTimesForStop(id).then(response => {
        console.log(response)
      })
    }
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
