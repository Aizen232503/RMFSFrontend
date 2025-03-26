import geopandas as gpd
from shapely.geometry import Point


def get_region(longitude, latitude):
    # 读取 GeoJSON 数据
    geojson = gpd.read_file('./src/components/echarts/map/China_fixed.json')
    # 创建一个表示给定经纬度的点
    point = Point(longitude, latitude)

    # 遍历 GeoJSON 数据的每个 feature
    for _, feature in geojson.iterrows():
        if feature['geometry'].contains(point):
            # 如果点在多边形内，那么这个 feature 就是我们要找的地区
            return feature['adcode']

    # 如果没有找到包含给定点的 feature，那么返回 None
    return None


if __name__ == '__main__':
    # 116.407394, 39.904211 是北京市的经纬度
    print(get_region(116.407394, 39.904211))  # 北京市 110000
    # 121.473662, 31.230372 是上海市的经纬度
    print(get_region(121.473662, 31.230372))  # 上海市 310000
    # 113.280637, 23.125178 是广州市的经纬度
    print(get_region(113.280637, 23.125178))  # 广东省 440000
    # 114.066112, 22.548515 是深圳市的经纬度
    print(get_region(114.066112, 22.548515))  # 广东省 440000
    # 113.264434, 23.129162 是珠海市的经纬度
    print(get_region(113.264434, 23.129162))  # 广东省 440000
