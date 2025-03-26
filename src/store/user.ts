import { set } from "ol/transform";
import { defineStore } from "pinia";
import { reactive } from "vue";

interface User {
    info: any,
    access: string[],
    permission: string[],
    token: string,
    access_token?: string,
    refresh_token?: string,
}
export const useUserStore = defineStore('user', () => {
    const 总调度中心: User = reactive({
        info: {
            apply_user_type: "总调度中心",
            apply_id: 7,
            apply_priority: 2,
            apply_unit_id: "KJ13T",
            apply_longitude: 126.13827604193446,
            apply_latitude: 26.83105213150032,
            apply_height: 471.0,
        },
        access: [
            "DemandsCreation",
            "OrdersList",
            "DemandsList",
            "StatisticsAndPrediction",
            "ParameterSettings",
        ],
        permission: [
            "TkoffOrder",
            "NaviOrder",
            "AttackOrder",
            "ReconOrder",
            "LandOrder",
        ],
        token: "ad92c560a25d4bb0be62316b6645d6d5",
        access_token: null,
        refresh_token: null,
    })
    const 起降调度中心: User = reactive({
        info: {
            apply_user_type: "起降调度中心",
            apply_id: 13,
            apply_priority: 2,
            apply_unit_id: "KJ13T",
            apply_longitude: 126.13827604193446,
            apply_latitude: 26.83105213150032,
            apply_height: 471.0,
        },
        access: [
            "DemandsCreation",
            "OrdersList",
            "StatisticsAndPrediction",
            "ParameterSettings"
        ],
        permission: ["TkoffOrder", "LandOrder"],
        token: "7e3212f9f76848f9a40d2a0927e40b89",
        access_token: null,
        refresh_token: null,
    })
    const 任务调度中心: User = reactive({
        info: {
            apply_user_type: "任务调度中心",
            apply_id: 8,
            apply_priority: 2,
            apply_unit_id: "KJ13T",
            apply_longitude: 126.13827604193446,
            apply_latitude: 26.83105213150032,
            apply_height: 471.0,
        },
        access: [
            "DemandsCreation",
            "OrdersList",
            "StatisticsAndPrediction",
            "ParameterSettings"
        ],
        permission: ["AttackOrder", "ReconOrder"],
        token: "9eabc89d22364acdba192fff25a4b2e8",
        access_token: null,
        refresh_token: null,
    })
    const 航路调度中心: User = reactive({
        info: {
            apply_user_type: "航路调度中心",
            apply_id: 18,
            apply_priority: 2,
            apply_unit_id: "KJ13T",
            apply_longitude: 126.13827604193446,
            apply_latitude: 26.83105213150032,
            apply_height: 471.0,
        },
        access: [
            "DemandsCreation",
            "OrdersList",
            "StatisticsAndPrediction",
            "ParameterSettings"
        ],
        permission: ["NaviOrder"],
        token: "a69d2535d5904a3d91071337a6fce2cc",
        access_token: null,
        refresh_token: null,
    })
    let ifLoggedIn = localStorage.getItem("currentUser")
    let currentUser: User = ifLoggedIn ? reactive(JSON.parse(ifLoggedIn)) : reactive({
        info: {
            apply_user_type: "",
            apply_id: null,
            apply_priority: null,
            apply_unit_id: "",
            apply_longitude: null,
            apply_latitude: null,
            apply_height: null,
        }, access: [], permission: [], token: null, access_token: null, refresh_token: null
    })
    const setUser = (newUser: User) => {
        console.log('新用户', newUser)
        // 直接更新属性而不是替换整个对象
        currentUser.info.apply_user_type = newUser.info.apply_user_type
        currentUser.info.apply_id = newUser.info.apply_id
        currentUser.info.apply_priority = newUser.info.apply_priority
        currentUser.info.apply_unit_id = newUser.info.apply_unit_id
        currentUser.info.apply_longitude = newUser.info.apply_longitude
        currentUser.info.apply_latitude = newUser.info.apply_latitude
        currentUser.info.apply_height = newUser.info.apply_height
        currentUser.access = newUser.access
        currentUser.permission = newUser.permission
        currentUser.token = newUser.token
        currentUser.access_token = newUser?.access_token
        currentUser.refresh_token = newUser?.refresh_token
        localStorage.setItem("currentUser", JSON.stringify(currentUser))
        console.log('已设置用户为：', JSON.stringify(currentUser))
    };

    // const setAccess = (raw_access) => {
    //     let access_obj = JSON.parse(raw_access);
    //     总调度中心.access = access_obj.总调度中心.access;
    //     起降调度中心.access = access_obj.起降调度中心.access;
    //     任务调度中心.access = access_obj.任务调度中心.access;
    //     航路调度中心.access = access_obj.航路调度中心.access;
    //     // console.log(2, currentUser.access, 22, access_o[currentUser.info.apply_user_type])
    //     currentUser.access = access_obj[currentUser.info.apply_user_type].access;

    // }
    // const readUser = () => {

    //     fetch('../../defaultUser.json')
    //         .then(response => response.json())
    //         .then(data => {
    //             Object.keys(data).forEach(key => {
    //                 storedUsers.value[data[key].info.apply_id] = data[key];
    //             })

    //         })
    //         .catch(error => console.error('Error:', error));
    // }

    // const logIn = (userForm) => {
    //     switch (userForm.id) {
    //         case '总调度中心':
    //             setUser(总调度中心);
    //             break;
    //         case '起降调度中心':
    //             setUser(起降调度中心);
    //             break;
    //         case '任务调度中心':
    //             setUser(任务调度中心);
    //             break;
    //         case '航路调度中心':
    //             setUser(航路调度中心);
    //             break;
    //     }
    // }

    const logOut = () => {
        setUser({
            info: {
                apply_user_type: "",
                apply_id: null,
                apply_priority: null,
                apply_unit_id: "",
                apply_longitude: null,
                apply_latitude: null,
                apply_height: null,
            }, access: [], permission: [], token: null, access_token: null, refresh_token: null
        });
        localStorage.removeItem("currentUser");
    }
    return { 总调度中心, 起降调度中心, 任务调度中心, 航路调度中心, currentUser, setUser, logOut };
},
);