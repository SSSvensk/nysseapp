<template>
    <v-card outlined class="elevation-0 pa-2 ma-0">
        <a @click="handleClick(data.shortName)">{{data.shortName}} {{data.longName}}</a>
        <div v-if="!loadingError && patternsLoaded">
            <v-container>
                <v-row v-if="directionMatters">
                    <v-col class="text-left" cols="6">
                        <div class="mb-3">
                            Suunta 1
                            <v-icon>mdi-chevron-right</v-icon>
                        </div>
                        <a @click="getStops(directions, directionHeadsign)">{{ directionHeadsign }}</a>
                    </v-col>
                    <v-col class="text-left" cols="6">
                        <div class="mb-3 ml-n3 pl-0">
                            <v-icon>mdi-chevron-left</v-icon>
                            Suunta 2
                        </div>
                        <a @click="getStops(otherDirections, otherDirectionHeadsign)">{{ otherDirectionHeadsign }}</a>
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-col class="text-center" cols="5">
                        Direction
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <div v-else-if="loadingError">
            <v-alert class="white--text" color="error">
                Latauksessa virhe!
            </v-alert>
        </div>
    </v-card>
</template>
<script>
import api from "@/api/api"

export default {
    name: "Route",
    props: {
        transportationType: String,
        data: Object
    },
    data() {
        return {
            loadingError: false,
            directions: [],
            otherDirections: [],
            directionMatters: false,
            patternsLoaded: false,
            directionHeadsign: null,
            otherDirectionHeadsign: null,

        }
    },
    methods: {
        handleClick(id) {
            console.log("clicked")
            console.log(id)
            this.getPatterns(id)
        },
        getDirectionHeadsigns(arr) {
            let headsigns = arr.map(x => x.headsign)
            let counts = headsigns.reduce((a, c) => {
                a[c] = (a[c] || 0) + 1;
                return a;
            }, {});
            let maxCount = Math.max(...Object.values(counts));
            let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);
            return mostFrequent[0]
        },
        getPatterns(id) {
            console.log(id)
            this.loadingError = false
            api.getPatterns(id, this.transportationType).then(response => {
                console.log(response)
                if (response.data.length > 0) {
                    if (this.transportationType == 'bus') {
                        const allPatterns = response.data[0].patterns
                        this.directions = allPatterns.filter(x => x.directionId === 0)
                        this.otherDirections = allPatterns.filter(x => x.directionId === 1)
                        
                    } else if (this.transportationType == 'train') {
                        response.data.forEach(route => {
                            this.directions = this.directions.concat(route.patterns.filter(x => x.directionId === 0))
                            this.otherDirections = this.otherDirections.concat(route.patterns.filter(x => x.directionId === 1))
                        });
                    }
                    if (this.directions.length > 0 && this.otherDirections.length > 0) {
                        this.directionHeadsign = this.getDirectionHeadsigns(this.directions)
                        this.otherDirectionHeadsign = this.getDirectionHeadsigns(this.otherDirections)
                        this.directionMatters = true
                    }
                    
                }
            })
            .catch(e => {
                console.log(e)
                this.loadingError = true
            })
            .finally(() => {
                 this.patternsLoaded = true
            })
        },
        getStops(patterns, headsign) {
            this.$emit('sendPatternCode', {patterns: patterns, shortName: this.data.shortName, headsign: headsign})
        }
    }
}
</script>