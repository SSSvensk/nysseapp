<template>
    <v-container class="home">
        <div v-if="loadingError">
            Virhe!
        </div>
        <div v-else-if="loading">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
            <v-row v-for="(line, index) in sortedList" v-bind:key="index" class="pa-0">
                <v-col class="pa-1">
                    <Route @sendPatternCode="sendPatternCode" :data="line" :transportationType="transportationType"></Route>
                </v-col>
            </v-row>
        </div>
    </v-container>
</template>
<script>
import Route from "@/components/linelist/Route.vue"

export default {
    name: 'LineList',
    components: {
        Route
    },
    props: {
        transportationType: String,
        loadingError: Boolean,
        loading: Boolean,
        lines: Array
    },
    computed: {
        sortedList() {
            let tmp = JSON.parse(JSON.stringify(this.lines))
            
            tmp.sort((a, b) => {
                let codeA = a.shortName;
                let codeB = b.shortName;
                let numbA = codeA.match(/\d/g);
                let numbB = codeB.match(/\d/g);
                if (numbA && numbB) {
                    numbA = parseInt(numbA.join(""));
                    numbB = parseInt(numbB.join(""));
                    if (numbA > numbB) {
                        return 1
                    } else {
                        return -1
                    }
                }
                return a - b
            });
            console.log(tmp)
            return tmp
        }
    },
    methods: {
        sendPatternCode(data) {
            this.$emit('sendPatternCode', data)
        }
    }
}
</script>
