# Soybean Admin

一个基于 Vue3、Vite7、TypeScript、NaiveUI、ProNaiveUI 和 UnoCSS 的清新优雅的中后台管理模板。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vite 7** - 下一代前端构建工具
- **TypeScript** - JavaScript超集
- **NaiveUI** - Vue3 UI组件库
- **ProNaiveUI** - NaiveUI增强组件库
- **UnoCSS** - 即时原子化CSS引擎
- **Pinia** - Vue状态管理

## 项目结构

```
├── src/                    # 源代码目录
│   ├── components/         # 公共组件
│   ├── constants/          # 常量定义
│   ├── enum/               # 枚举类型
│   ├── hooks/              # 组合式函数
│   ├── layouts/            # 布局组件
│   ├── locales/            # 国际化配置
│   ├── router/             # 路由配置
│   ├── service/            # API服务
│   ├── store/              # 状态管理
│   ├── styles/             # 全局样式
│   ├── theme/              # 主题配置
│   ├── typings/            # 类型定义
│   ├── utils/              # 工具函数
│   └── views/              # 页面视图
├── packages/               # 内部包
│   ├── axios/              # Axios封装
│   ├── color/              # 颜色工具
│   ├── hooks/              # 组合式函数包
│   ├── materials/          # 素材组件
│   ├── scripts/            # 构建脚本
│   ├── uno-preset/         # UnoCSS预设
│   └── utils/              # 工具函数包
├── build/                  # 构建配置
├── public/                 # 静态资源
└── pnpm-workspace.yaml     # pnpm工作区配置
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## 主要功能

- 🌈 清新优雅的UI设计
- 🎨 主题定制与切换
- 🌐 国际化支持
- 📱 响应式布局
- 🔐 权限管理与认证
- 📊 数据可视化图表
- 🎯 TypeScript类型安全

## License

MIT
