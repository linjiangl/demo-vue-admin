<script setup lang="ts">
import { ProPassword } from 'pro-naive-ui';

export interface Props {
  type?: 'add' | 'edit' | 'password';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'add'
});
</script>

<template>
  <template v-if="props.type == 'add'">
    <ProInput title="用户名" path="username" required />
    <ProInput title="姓名" path="real_name" />
    <ProInput title="手机号码" path="phone" />
    <ProPassword title="密码" path="password" required />
    <ProPassword title="确认密码" path="password_confirmation" required />
  </template>
  <template v-else-if="props.type == 'edit'">
    <ProInput title="用户名" path="username" readonly />
    <ProInput title="姓名" path="real_name" />
    <ProInput title="手机号码" path="phone" />
  </template>
  <template v-else>
    <ProInput title="用户名" path="username" readonly />
    <ProPassword title="密码" path="password" required />
    <ProPassword title="确认密码" path="password_confirmation" required />
  </template>
</template>
