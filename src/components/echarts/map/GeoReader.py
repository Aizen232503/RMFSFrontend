import geopandas as gpd
import os
from shapely.geometry import Point


def get_region(longitude, latitude):
    # 读取 GeoJSON 数据
    geojson = gpd.read_file('./src/components/echarts/map/China.json')
    filepath = './src/components/echarts/map/China_fixed.json'

    # 检查并修复无效的几何形状
    invalid_geometries = geojson[~geojson['geometry'].is_valid]
    if not invalid_geometries.empty:
        print('Invalid geometries found, attempting to fix...')
        geojson['geometry'] = geojson['geometry'].buffer(0)

    # 再次检查几何形状是否有效
    invalid_geometries = geojson[~geojson['geometry'].is_valid]
    if not invalid_geometries.empty:
        print('Invalid geometries still exist:')
        print(invalid_geometries)
    # 保存修复后的 GeoJSON 数据
    geojson.to_file(filepath, driver='GeoJSON')
    # 创建一个表示给定经纬度的点
    point = Point(longitude, latitude)

    # 遍历 GeoJSON 数据的每个 feature
    for _, feature in geojson.iterrows():
        if feature['geometry'].contains(point):
            # 如果点在多边形内，那么这个 feature 就是我们要找的地区
            return feature['name']

    # 如果没有找到包含给定点的 feature，那么返回 None
    return None


if __name__ == '__main__':
    # 116.407394, 39.904211 是北京市的经纬度
    print(get_region(116.407394, 39.904211))  # 北京市
