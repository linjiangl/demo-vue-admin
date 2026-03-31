# 智能体编码指南

本文档为在这个 Vue3 + NaiveUI 管理后台代码库中工作的智能体提供协作规范。

## 沟通约定

- 默认使用中文与用户沟通和输出内容，除非用户明确要求切换到其他语言。

## 构建命令

```bash
# 安装依赖
pnpm install

# 开发模式（测试环境，默认）
pnpm dev

# 开发模式（生产环境）
pnpm dev:prod

# 构建生产版本
pnpm build

# 构建测试环境版本
pnpm build:test

# 类型检查
pnpm typecheck

# 代码检查并修复
pnpm lint

# 预览构建产物
pnpm preview

# 交互式提交
pnpm commit

# 生成路由
pnpm gen-route

# 清理未使用文件
pnpm cleanup
```

**注意：** 当前代码库未配置测试框架，因此没有可用的测试命令。

## 代码风格

### TypeScript

- 在 `tsconfig` 中启用严格类型检查：`"strict": true`
- 所有数据结构的接口或类型定义放在 `src/typings/` 下
- 简单类型优先使用 `type`，复杂对象优先使用 `interface`
- 避免使用 `any`，只有在确实无法确定类型时才使用 `unknown`
- 后端 API 类型定义放在 `src/typings/api/`

### Vue 组件

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton } from 'naive-ui';
import type { SomeType } from '@/typings';

defineOptions({ name: 'MyComponent' });

const props = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  (e: 'update', value: string): void;
}>();
</script>

<template>
  <div class="container">
    <NButton>{{ props.title }}</NButton>
  </div>
</template>

<style scoped>
.container {
  padding: 16px;
}
</style>
```

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.vue` |
| 文件 | kebab-case | `use-user-list.ts` |
| 函数 | camelCase | `fetchUserData()` |
| 组合式函数 | `use` 前缀 | `usePagination()` |
| 常量 | SCREAMING_SNAKE | `MAX_ITEMS` |
| 类型 / 接口 | PascalCase | `UserInfo` |
| CSS 类名 | kebab-case | `user-card` |
| 枚举 | PascalCase | `SetupStoreId` |

### CSS 与样式

- 优先使用 UnoCSS 原子类（如 `p-16px`、`flex` 等）
- Vue 组件中使用 `scoped` 样式
- UnoCSS 快捷方式定义在 `uno.config.ts` 中
- 暗黑模式使用 `dark:` 前缀
- 卡片样式快捷类：`card-wrapper`，用于带圆角和阴影的卡片
- 图标尺寸快捷类：`icon-xs`、`icon-small`、`icon`、`icon-large`、`icon-xl`

### 导入规范

```typescript
// Vue 核心
import { ref, computed, watch } from 'vue';

// 内部模块（使用 @ 别名）
import { useUserStore } from '@/store/modules/auth';
import { fetchUserList } from '@/service/api/user';

// UI 库
import { NButton, NDataTable } from 'naive-ui';

// 来自 @iconify 的图标
import IconHome from '@iconify-icons/ep/home';
```

### 路径别名

- `@/*` -> `./src/*`
- `~/*` -> `./*`

### 格式化规范（Prettier）

- 行宽：120 字符
- 缩进：2 个空格
- JavaScript 使用单引号
- 始终保留尾随逗号
- 必须使用分号
- 换行符：`lf`

## 文件结构

```text
src/
├── components/     # 可复用组件
│   ├── advanced/   # 高级组件
│   ├── common/     # 通用 UI 组件
│   ├── custom/     # 自定义组件
│   └── pro/        # ProNaiveUI 组件
├── views/          # 页面组件
├── store/          # Pinia 状态仓库
│   └── modules/    # 模块化 store（auth、app、theme、route、tab）
├── service/        # API 服务
│   ├── api/        # API 接口定义
│   └── request/    # Axios 请求配置
├── router/         # 路由配置
├── hooks/          # 组合式函数
│   ├── business/   # 业务逻辑 hooks
│   └── common/     # 通用 hooks
├── utils/          # 工具函数
├── constants/      # 常量
├── enum/           # 枚举
├── typings/        # 全局类型
│   └── api/        # 后端 API 类型
├── layouts/        # 布局组件
├── locales/        # 国际化翻译
├── plugins/        # Vue 插件
└── styles/         # 全局样式
```

## API 模式

```typescript
// API 函数返回带类型的响应结果
import { request } from '@/service/request';

export function fetchUserList(params?: Api.User.UserSearchParams) {
  return request<Api.User.UserList>({
    url: '/users',
    method: 'get',
    params
  });
}
```

## 错误处理

- 搭配 `async/await` 使用 `try/catch`
- 提供用户可理解的错误提示信息
- 错误提示使用 `window.$message?.error()`
- 模态错误提示使用 `window.$dialog?.error()`
- 对空值或未定义值使用可选链（`?.`）
- 使用 `console.error` 或 `consola` 记录错误

## 提交规范

使用 `pnpm commit` 以交互方式生成符合 Conventional Commits 的提交信息。

## 提交前钩子

提交时会执行以下检查：

1. TypeScript 检查（`vue-tsc --noEmit`）
2. ESLint 自动修复
3. Git diff 检查

## 关键依赖

- **Vue 3.5**：基于 `<script setup>` 的组合式 API
- **NaiveUI 2.43**：UI 组件库
- **ProNaiveUI 3.2**：增强型 UI 组件库
- **Pinia 3.0**：状态管理
- **Vue Router 4**：路由
- **UnoCSS**：基于 preset-wind3 的原子化 CSS
- **TypeScript 5.9**：类型安全
- **@sa/axios**：HTTP 请求工具
- **dayjs**：日期格式化
- **echarts**：图表库
- **vue-i18n**：国际化
