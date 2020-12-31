<template>
  <v-container class="home">
    <v-row>
      <v-col>
    <v-row>
      <v-col class="text-center">
        <v-row>
          <v-col v-for="(item, index) in transportationTypes" v-bind:key="index">
            <v-btn depressed fab :color="item.color" dark x-large @click="chooseTransportationType(item.name)">
              <v-icon x-large dark>{{ "mdi-" + item.name }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="chosenTransportationMode">
        <v-container fluid v-if="!loading && !loadingError">
          <LineList 
            :transportationType="transportationType" 
            :lines="lines" 
            :loadingError="loadingError"
            @sendPatternCode="receivePatternCode"
          ></LineList>
        </v-container>
        
        <v-container v-else-if="loadingError">
          <v-alert color="error" class="white--text text--lighten-5">
            Lataus epäonnistui
          </v-alert>
        </v-container>
        <v-container class="text-center text--lighten-5" v-else-if="transportationType == 'tram'">
          <h2>Raitiotien aikatauluja ei vielä julkaistu</h2>
        </v-container>
        <v-container v-else-if="loading" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-container>
      </v-col>
      <v-col v-else class="font-weight-light text-center">
        <h2 class="font-weight-light">Valitse liikenneväline</h2>
      </v-col>
    </v-row>
      </v-col>
      <v-col v-if="chosenPatterns.length > 0">
        <StopList
          :transportationType="transportationType"
          :patterns.sync="chosenPatterns"
          :line.sync="chosenLine"
          :headsign.sync="headsign"
        ></StopList>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "@/api/api"
import LineList from "@/components/linelist/LineList.vue"
import StopList from "@/components/stoplist/Stoplist.vue"

export default {
  name: 'Home',
  components: {
    LineList,
    StopList
  },
  data() {
    return {
      lines: [],
      chosenPatterns: [],
      chosenLine: null,
      transportationType: null,
      chosenTransportationMode: false,
      transportationTypes: [{name: "bus", color: "primary"}, {name: "tram", color: "red"}, {name: "train", color: "green"}],
      loadingError: false,
      loading: false,
      headsign: ""
    }
  },
  methods: {
    receivePatternCode(data) {
      this.headsign = data.headsign
      this.chosenPatterns = data.patterns
      this.chosenLine = data.shortName
    },
    chooseTransportationType(item) {
      this.chosenPatterns = []
      this.loadingError = false
      this.loading = true
      this.chosenTransportationMode = true
      this.transportationType = item
      if (item == "bus") {
        api.getBuses().then(response => {
          this.lines = response.data
        })
        .catch(() => {
          this.loadingError = true
        })
        .finally(() => {
          this.loading = false
        })
      } else if (item == "train") {
        console.log("here")
        api.getTrains().then(response => {
          this.lines = response.data
          console.log(response)
        })
        .catch(() => {
          this.loadingError = true
        })
        .finally(() => {
          this.loading = false
        })
      }
      
    }
  }
}
</script>
