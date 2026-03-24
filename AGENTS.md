# Agent Coding Guidelines

This file provides guidelines for agents working in this Vue3 + NaiveUI admin codebase.

## Build Commands

```bash
# Install dependencies
pnpm install

# Development (test mode)
pnpm dev

# Development (prod mode)
pnpm dev:prod

# Build for production
pnpm build

# Build for test environment
pnpm build:test

# Type checking
pnpm typecheck

# Lint and fix
pnpm lint

# Preview build
pnpm preview
```

## Project Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | Run vue-tsc |
| `pnpm lint` | ESLint with auto-fix |
| `pnpm commit` | Interactive commit |
| `pnpm gen-route` | Generate routes |

## Code Style

### TypeScript
- Use strict TypeScript typing
- Define interfaces/types for all data structures
- Use `type` for simple types, `interface` for complex objects
- Avoid `any`, use `unknown` when type is truly unknown

### Vue Components
```vue
<script setup lang="ts">
// Named imports, grouped by category
import { computed, ref } from 'vue';
import { NButton } from 'naive-ui';
import type { SomeType } from '@/types';

// Component name is required
defineOptions({ name: 'MyComponent' });

// Composition API with setup
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

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.vue` |
| Files | kebab-case | `use-user-list.ts` |
| Functions | camelCase | `fetchUserData()` |
| Composables | use-prefix | `usePagination()` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |
| Types/Interfaces | PascalCase | `UserInfo` |
| CSS classes | kebab-case | `user-card` |

### CSS & Styling
- Use UnoCSS utility classes first (`p-16px`, `flex`, etc.)
- Use `scoped` styles in Vue components
- UnoCSS shortcuts defined in `uno.config.ts`
- Dark mode via `dark:` prefix

### Imports
```typescript
// Vue core
import { ref, computed, watch } from 'vue';

// Internal modules (use @ alias)
import { useUserStore } from '@/store/modules/user';
import { getUserList } from '@/service/api/user';

// UI libraries
import { NButton, NDataTable } from 'naive-ui';

// Icons from @iconify
import IconHome from '@iconify-icons/ep/home';
```

### Error Handling
- Use try/catch with async/await
- Provide user-friendly error messages
- Log errors appropriately (use consola for logging)
- Handle null/undefined with optional chaining

### File Structure
```
src/
├── components/     # Reusable components
│   ├── common/     # Common UI components
│   └── pro/        # ProNaiveUI components
├── views/          # Page components
├── store/          # Pinia stores
├── service/        # API services
├── router/         # Route config
├── hooks/          # Composables
├── utils/          # Utility functions
├── constants/      # Constants
├── enum/           # Enums
└── typings/        # Global types
```

### Path Aliases
- `@/*` → `./src/*`
- `~/*` → `./*`

## Commit Guidelines

Use `pnpm commit` for interactive commit message generation following Conventional Commits.

## Pre-commit Hooks

The following checks run on commit:
1. TypeScript check (`vue-tsc`)
2. ESLint with auto-fix
3. Git diff check

## Key Dependencies

- **Vue 3.5** - Composition API with `<script setup>`
- **NaiveUI 2.43** - UI components
- **ProNaiveUI 3.2** - Enhanced components
- **Pinia 3.0** - State management
- **Vue Router 4** - Routing
- **UnoCSS** - Atomic CSS
- **TypeScript 5.9** - Type safety
