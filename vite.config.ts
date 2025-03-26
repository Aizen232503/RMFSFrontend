import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import Components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import compression from 'vite-plugin-compression'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from "path"
import { resolve } from "path"
export default ({ mode }) => {
  // 加载当前模式下的环境变量
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    // 插件列表
    plugins: [
      // 启用 Vue 插件
      vue(),
      viteMockServe({
        supportTs: true, //是否开启支持ts
        mockPath: 'mock', //设置mockPath为根目录下的mock目录,为根目录
        localEnabled: true, //设置是否监视mockPath对应的文件夹内文件中的更改
        prodEnabled: true, //prod环境下是否可以使用mock
        watchFiles: true, //是否监视mockPath对应的文件夹内文件中的更改
        logger: false, //是否在控制台显示请求日志
        injectCode: `import { setupProdMockServer } from './src/mockProdServer.ts';
        setupProdMockServer();`, //设置生产环境下的mock代码
        injectFile: resolve('./src/main.ts'), //设置注入的文件
      }),
      // 启用 vite-plugin-vue-setup-extend 插件，用于扩展 Vue 组件选项
      VueSetupExtend(),
      // 启用 unplugin-vue-components 插件，用于自动导入和注册 Vue 组件
      Components({
        // 使用 ElementPlusResolver 解析 Element Plus 组件
        resolvers: [ElementPlusResolver()],
        // 生成 .d.ts 文件，用于 TypeScript 类型检查
        dts: false,
      }),
      // 启用 unplugin-auto-import 插件，用于自动导入指定的模块
      autoImport({
        // 指定要自动导入的模块
        imports: ['vue', 'vue-router', 'pinia'],
        // 生成 .d.ts 文件，用于 TypeScript 类型检查
        dts: true,
      }),
      // 启用 vite-plugin-compression 插件，用于压缩构建输出
      compression({
        // 只压缩大于 1024 字节的文件
        threshold: 1024,
        // 使用 gzip 算法压缩
        algorithm: 'gzip',
        // 压缩后的文件扩展名
        ext: '.gz',
        // 不删除原始文件
        deleteOriginFile: false,
      }),
    ],
    // 项目根目录
    root: './',
    // 静态资源目录
    publicDir: 'public',
    // 基础路径
    base: './',
    // 构建模式
    mode: 'development',
    // 模块解析配置
    resolve: {
      // 别名
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@static": path.resolve(__dirname, "static"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@mixins": path.resolve(__dirname, "src/mixins"),
        "@comps": path.resolve(__dirname, "src/components"),
        "@views": path.resolve(__dirname, "src/views"),
        "@plugins": path.resolve(__dirname, "src/plugins"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@api": path.resolve(__dirname, "src/api"),
      },
      // 扩展名
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `
          @import "${path.resolve(__dirname, './node_modules/ayin-lessmixins/ayin-lessmixins.less')}";
          @import "${path.resolve(__dirname, './node_modules/ayin-color/ayin-color.less')}";
          @import "${path.resolve(__dirname, './node_modules/ayin-color/ayin-color-expand.less')}";
          `
          //引入的less全局变量，来自于开源组件ayin-color和ayin-lessmixins，访问https://www.npmjs.com/package/ayin-color 查看相关信息
        }
      }
    },
    optimizeDeps: {
      include: ['echarts', 'ayin-color'],
      exclude: ['techui-vue3-lite']
    },
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      // 端口
      port: 3000,
      // 代理配置
      proxy: {
        //将 '/frontend' 代理到 VITE_SERVER
        '/frontend': {
          target: env.VITE_SERVER,
          changeOrigin: true,
          headers: { Connection: 'keep-alive' },
          // 重写路径，去掉 '/frontend'
          rewrite: (path) => path.replace(/^\/frontend/, ''),
        },
      },
    }
  })
}