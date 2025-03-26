import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useOthersStore = defineStore('others', () => {
    const droneInfos = ref([]);
    const airportInfos = ref([]);
    const controlPoints = ref([]);
    return {
        droneInfos,
        airportInfos,
        controlPoints
    };
},
    {
        persist: true,
    }
);