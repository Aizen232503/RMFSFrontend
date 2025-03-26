import * as api from "@/api/";
import { pinia } from '@/main';
import { useUserStore } from "@/store/user";
export default {
    install(app) {
        app.config.globalProperties.saveForm = (form) => {
            console.log(JSON.stringify(form))
        }
        app.config.globalProperties.submitForm = (form) => {
            return form
        }
        app.config.globalProperties.setDefault = (form, defaultForm) => {
            if (JSON.stringify(defaultForm) != "{}") {
                Object.keys(form).forEach((key) => {
                    if (key in defaultForm) {
                        Reflect.set(form, key, defaultForm[key]);
                    }
                });
            }
        }
        app.config.globalProperties.translateOrderType = (type_CN) => {
            for (const key in orderTypeDict) {
                if (orderTypeDict[key] == type_CN) {
                    return key;
                }
            }
            return null;
        }
        app.config.globalProperties.interpretOrderType = interpretOrderType
        // 将形如"领航 降落 起飞 侦察 打击"的订单序列包装成英文名数组
        app.config.globalProperties.translateOrderSeries = (types_CN) => {
            return types_CN.split(" ").map(type_CN => app.config.globalProperties.translateOrderType(type_CN));
        }
        app.config.globalProperties.interpretOrderSeries = interpretOrderSeries
        app.config.globalProperties.interpretFormItems = interpretFormItems
        app.config.globalProperties.getTagType = (value, mode = '') => {
            if (mode === 'order_priority') {
                switch (value) {
                    case '高':
                        return 'danger';
                    case '中':
                        return 'warning';
                    case '低':
                        return 'info';
                    default:
                        return 'primary';
                }
            }
            if (mode === 'order_status') {
                switch (value) {

                    case '完成':
                        return 'success';

                    case '等待':
                        return 'info';

                    case '拣选中':
                        return 'primary';
                    default:
                        return 'primary';
                }
            }
            if (mode === 'robot_status') {
                switch (value) {

                    case '空闲':
                        return 'success';

                    case '待机中':
                        return 'info';

                    case '搬运中':
                        return 'primary';
                    default:
                        return 'primary';
                }
            }
            if (mode === 'station_status') {
                switch (value) {

                    case '空闲':
                        return 'success';

                    case '故障':
                        return 'danger';

                    case '忙碌':
                        return 'primary';
                    default:
                        return 'primary';
                }
            }
            return value
        }
        app.config.globalProperties.getProgressColor = (percentage) => {
            if (percentage < 10) {
                return '#ff4d4f'; // 深红色，表示非常低的进度
            } else if (percentage < 30) {
                return '#f56c6c'; // 红色，表示低进度
            } else if (percentage < 50) {
                return '#e6a23c'; // 橙色，表示中等偏低进度
            } else if (percentage < 70) {
                return '#fadb14'; // 黄色，表示中等进度
            } else if (percentage < 90) {
                return '#67c23a'; // 绿色，表示中等偏高进度
            } else {
                return '#52c41a'; // 深绿色，表示接近完成
            }
        };
        app.config.globalProperties.isEmpty = (value) => {
            return value === null || value === undefined || value === '';
        }
        app.config.globalProperties.areSame = (...values: number[]) => {
            if (values.length === 0) {
                return true; // 如果没有参数，我们认为所有值都相等
            }

            const firstValue = values[0];
            return values.every(value => app.config.globalProperties.isEmpty(value) === app.config.globalProperties.isEmpty(firstValue));
        }
        app.config.globalProperties.interpretDroneStatus = (num) => {
            switch (num) {
                case 0:
                    return '可用';

                default:
                    return '不可用';
            }
        }

        app.config.globalProperties.filterEmpties = filterEmpties
        app.config.globalProperties.debounce = (func, wait) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }
    }
}

export const interpretOrderType = (type_EN) => {
    return orderTypeDict[type_EN];
}
export const interpretOrderSeries = (types_EN) => {
    return types_EN.map(type_EN => interpretOrderType(type_EN)).join(",");
}
export const interpretFormItems = (item_EN) => {
    return formItemDict[item_EN] || item_EN;
}
export const filterEmpties = (obj) => {
    // 过滤对象里的空值和未定义值
    const result = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            result[key] = obj[key];
        }
    }
    return result;
}
const orderTypeDict = { 'TkoffOrder': '起飞', 'NaviOrder': '领航', 'AttackOrder': '打击', 'ReconOrder': '侦察', 'LandOrder': '降落' }
const droneTypeDict = {
    0: "攻击无人机",
    1: "侦察无人机",
    2: "察打一体无人机", 3: "无人僚机", 4: "反辐射无人机", 5: "诱饵无人机", 6: "预警机"
}
const formItemDict = {
    demand_type_name: "需求名称",
    demand_description: "需求描述",
    order_id: "订单ID",
    order_name: "订单名称",
    create_time: "创建时间",
    apply_id: "申请人编号",
    apply_user_type: "申请人类型",
    apply_priority: "申请人优先级",
    apply_unit_id: "申请人部队编号",
    apply_expected_priority: "期望优先级",
    apply: "申请人位置",
    apply_longitude: "申请人经度",
    apply_latitude: "申请人纬度",
    apply_height: "申请人高度",
    demand_id: "需求id",
    demand_type: "需求类型",
    demand_order_count: "订单数量",
    demand_sequence_number: "序列顺序",
    drone_sum: "无人机总数",
    drone1_id: "无人机1ID",
    drone1_shiptime: "无人机1航时",
    drone1_longitude: "无人机1经度",
    drone1_latitude: "无人机1纬度",
    drone1_height: "无人机1高度",
    drone2_id: "无人机2ID",
    drone2_shiptime: "无人机2航时",
    drone2_longitude: "无人机2经度",
    drone2_latitude: "无人机2纬度",
    drone2_height: "无人机2高度",
    drone3_id: "无人机3ID",
    drone3_shiptime: "无人机3航时",
    drone3_longitude: "无人机3经度",
    drone3_latitude: "无人机3纬度",
    drone3_height: "无人机3高度",
    drone_type1: "无人机机型1",
    drone_number1: "无人机机型1数量",
    drone_type2: "无人机机型2",
    drone_number2: "无人机机型2数量",
    drone_type3: "无人机机型3",
    drone_number3: "无人机机型3数量",
    remark: "备注",
    accept_type: "受理人类型",
    accept_id: "受理人ID",
    accept_reply: "受理人批复",
    sort_value: "订单优先级函数值",
    sort_istop: "强制置顶",
    sort_sequence_number: "排序序号",
    relate_if: "关联与否",
    relate_index: "关联索引",
    relate_order_number: "该条关联建议订单数量",
    relate_sequence_number: "关联序号",
    relate_start_time: "关联订单开始时刻",
    relate_end_time: "关联订单结束时刻",
    dispatch_drone_sum: "无人机数量",
    dispatch_drone1_id: "无人机1ID",
    dispatch_drone2_id: "无人机2ID",
    dispatch_drone3_id: "无人机3ID",
    order_status: "订单状态标识位",
    tactic_guide: "引导类型",
    tactic_guider: "引导员编号",
    tactic_frequency_point1: "频点1",
    tactic_frequency_point2: "频点2",
    tactic_CP: "CP点",
    tactic_CP_longitude: "CP点经度",
    tactic_CP_latitude: "CP点纬度",
    tactic_CP_height: "CP点高度",
    tactic_IP: "IP点",
    tactic_IP_suggestion: "IP点经度",
    tactic_IP_latitude: "IP点纬度",
    tactic_IP_height: "IP点高度",
    tactic_EP_suggestion: "推荐EP点",
    tactic_EP: "EP点",
    tactic_EP_longitude: "EP点经度",
    tactic_EP_latitude: "EP点纬度",
    tactic_EP_height: "EP点高度",
    tactic_command_control: "指挥控制限制",
    tactic_command_leave: "指挥脱离限制",
    schedule_id: "任务计划ID",
    target_type: "目标类型",
    target_number: "目标数量",
    target_threat_level: "目标威胁等级",
    target: "目标点",
    target_longitude: "目标经度",
    target_latitude: "目标纬度",
    target_height: "目标高度",
    target_precision: "目标精度",
    target_move_speed: "运动速度",
    target_move_direction: "运动方向",
    attack_type: "打击类型",
    attack_ASAP: "尽快",
    attack_start_time: "打击开始时刻",
    attack_end_time: "打击结束时刻",
    attack_duration: "打击时长",
    attack_damage: "毁伤要求",
    attack_constraint: "打击约束",
    attack_part: "打击部位",
    expect_ammunition_type1: "弹药1型号",
    expect_ammunition_num1: "弹药1数量",
    expect_ammunition_type2: "弹药2型号",
    expect_ammunition_num2: "弹药2数量",
    expect_ammunition_type3: "弹药3型号",
    expect_ammunition_num3: "弹药3数量",
    expect_ammunition_type4: "弹药4型号",
    expect_ammunition_num4: "弹药4数量",
    interest_location_type: "兴趣位置类型",
    interest_point: "兴趣点",
    interest_point_longitude: "兴趣点经度",
    interest_point_latitude: "兴趣点纬度",
    interest_point_height: "兴趣点高度",
    interest_circle: "兴趣圆圆心",
    interest_circle_longitude: "兴趣圆圆心经度",
    interest_circle_latitude: "兴趣圆圆心纬度",
    interest_circle_height: "兴趣圆圆心高度",
    interest_circle_radius: "兴趣圆半径",
    interest_polygon_vertx: "兴趣多边形顶点",
    interest_polygon_vertx1_longitude: "兴趣多边形顶点1经度",
    interest_polygon_vertx1_latitude: "兴趣多边形顶点1纬度",
    interest_polygon_vertx1_height: "兴趣多边形顶点1高度",
    interest_polygon_vertx2_longitude: "兴趣多边形顶点2经度",
    interest_polygon_vertx2_latitude: "兴趣多边形顶点2纬度",
    interest_polygon_vertx2_height: "兴趣多边形顶点2高度",
    interest_polygon_vertx3_longitude: "兴趣多边形顶点3经度",
    interest_polygon_vertx3_latitude: "兴趣多边形顶点3纬度",
    interest_polygon_vertx3_height: "兴趣多边形顶点3高度",
    interest_polygon_vertx4_longitude: "兴趣多边形顶点4经度",
    interest_polygon_vertx4_latitude: "兴趣多边形顶点4纬度",
    interest_polygon_vertx4_height: "兴趣多边形顶点4高度",
    interest_location_terrain: "兴趣位置地理属性",
    estimated_target_type: "预计目标类型",
    estimated_target_number: "预计目标数量",
    estimated_target_threat_level: "预计目标区域威胁等级",
    recon_type: "侦察类型",
    recon_ASAP: "尽快",
    recon_start_time: "侦察开始时刻",
    recon_end_time: "侦察结束时刻",
    recon_duration: "侦察时长",
    recon_constraint_discovery: "侦察约束：发现",
    recon_constraint_identification: "侦察约束：识别",
    recon_constraint_location: "侦察约束：定位",
    recon_load_type_optical_visible: "载荷类型：光电（可见光）",
    recon_load_type_optical_infrared: "载荷类型：光电（红外）",
    recon_load_type_optical_laser: "载荷类型：光电（激光）",
    recon_load_type_SAR_GMTI: "载荷类型：SAR（GMTI）",
    recon_load_type_SAR_beam: "载荷类型：SAR（聚束）",
    recon_load_type_SAR_strip: "载荷类型：SAR（条带)",
    recon_load_type_electronic_communication: "载荷类型：电侦（通侦)",
    recon_load_type_electronic_thunder: "载荷类型：电侦（雷侦)",
    tkoff_type: "起飞类型",
    tkoff_ASAP: "尽快",
    tkoff_start_time: "预约起飞开始时刻",
    tkoff_end_time: "预约起飞结束时刻",
    tkoff_airport_prioirity: "优先起飞机场",
    tkoff_bTOP: "预约起飞交接点",
    tkoff_bTOP_longitude: "预约起飞交接点经度",
    tkoff_bTOP_latitude: "预约起飞交接点纬度",
    tkoff_bTOP_height: "预约起飞交接点高度",
    tkoff_bTOP_radius: "预约起飞交接点半径",
    tkoff_CP_id: "起飞控制点编号",
    tkoff_ammunition_type1: "弹药1型号",
    tkoff_ammunition_num1: "弹药1数量",
    tkoff_ammunition_type2: "弹药2型号",
    tkoff_ammunition_num2: "弹药2数量",
    tkoff_ammunition_type3: "弹药3型号",
    tkoff_ammunition_num3: "弹药3数量",
    tkoff_oil_type1: "燃油1型号",
    tkoff_oil_num1: "燃油1数量",
    tkoff_oil_type2: "燃油2型号",
    tkoff_oil_num2: "燃油2数量",
    tkoff_oil_type3: "燃油3型号",
    tkoff_oil_num3: "燃油3数量",
    tkoff_airport: "起飞机场",
    tkoff_TOP: "起飞交接点",
    tkoff_TOP_longitude: "起飞交接点经度",
    tkoff_TOP_latitude: "起飞交接点纬度",
    tkoff_TOP_height: "起飞交接点高度",
    tkoff_runway: "起飞跑道",
    tkoff_time: "起飞时间",
    tkoff_schedule_id: "起飞计划ID",
    land_type: "降落类型",
    land_ASAP: "尽快",
    land_start_time: "预约降落起始时刻",
    land_end_time: "预约降落结束时刻",
    land_airport_prioirity: "优先降落机场",
    land_drone_value: "价值",
    land_drone_fault: "故障",
    land_ammunition_type1: "弹药1型号",
    land_ammunition_num1: "弹药1数量",
    land_ammunition_type2: "弹药2型号",
    land_ammunition_num2: "弹药2数量",
    land_ammunition_type3: "弹药3型号",
    land_ammunition_num3: "弹药3数量",
    land_oil_type1: "燃油1型号",
    land_oil_num1: "燃油1数量",
    land_oil_type2: "燃油2型号",
    land_oil_num2: "燃油2数量",
    land_oil_type3: "燃油3型号",
    land_oil_num3: "燃油3数量",
    land_airport: "降落机场",
    land_time: "降落时间",
    land_airport_longitude: "降落机场纬度",
    land_airport_height: "降落机场高度",
    land_TOP: "降落交接点",
    land_TOP_longitude: "降落交接点经度",
    land_TOP_latitude: "降落交接点纬度",
    land_TOP_height: "降落交接点高度",
    land_runway: "降落跑道",
    land_schedule_id: "降落计划ID",
    navi_isout: "是否出航",
    navi_type: "领航类型",
    navi_pipe_priority: "优先航路管道",
    navi_bQidian: "预约起点",
    navi_bQidian_longitude: "预约起点经度",
    navi_bQidian_latitude: "预约起点纬度",
    navi_bQidian_height: "预约起点高度",
    navi_bQidian_takeover_time: "预约起点交接时刻",
    navi_bQidian_takeover_timewindow: "预约起点交接时间窗口",
    navi_bZhongdian: "预约终点",
    navi_bZhongdian_longitude: "预约终点经度",
    navi_bZhongdian_latitude: "预约终点纬度",
    navi_bZhongdian_height: "预约终点高度",
    navi_bZhongdian_takeover_time: "预约终点交接时刻",
    navi_bZhongdian_takeover_timewindow: "预约终点交接时间窗口",
    navi_drone_value: "价值",
    navi_drone_fault: "故障",
    navi_pipe: "航路管道",
    navi_qidian: "起点",
    navi_qidian_longitude: "起点经度",
    navi_qidian_latitude: "起点纬度",
    navi_qidian_height: "起点高度",
    navi_qidian_takeover_time: "起点交接时刻",
    navi_qidian_takeover_timewindow: "起点交接时间窗口",
    navi_zhongdian: "终点",
    navi_zhongdian_longitude: "终点经度",
    navi_zhongdian_latitude: "终点纬度",
    navi_zhongdian_height: "终点高度",
    navi_zhongdian_takeover_time: "终点交接时刻",
    navi_zhongdian_takeover_timewindow: "终点交接时间窗口",
    navi_schedule_id: "领航计划ID",
};