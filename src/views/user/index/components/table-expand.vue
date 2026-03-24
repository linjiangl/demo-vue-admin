<script setup lang="ts">
import DateFormat from '@/components/common/date/date-format.vue';

interface Props {
  user: Api.User.User;
}

defineProps<Props>();
</script>

<template>
  <NCard>
    <NSpace vertical :size="12">
      <NDescriptions label-placement="left" :column="2">
        <NDescriptionsItem label="最后登录时间" :span="1"><DateFormat :date="user.last_login_at" /></NDescriptionsItem>
        <NDescriptionsItem label="最后活跃时间" :span="1"><DateFormat :date="user.last_active_at" /></NDescriptionsItem>
        <NDescriptionsItem label="手机验证时间" :span="1">
          <DateFormat :date="user.property?.verified_mobile_at" />
        </NDescriptionsItem>
        <NDescriptionsItem label="邮箱验证时间" :span="1">
          <DateFormat :date="user.property?.verified_email_at" />
        </NDescriptionsItem>
        <NDescriptionsItem label="头像设置时间" :span="1">
          <DateFormat :date="user.property?.updated_avatar_at" />
        </NDescriptionsItem>
        <NDescriptionsItem label="用户名设置时间" :span="1">
          <DateFormat :date="user.property?.updated_username_at" />
        </NDescriptionsItem>
      </NDescriptions>
    </NSpace>
  </NCard>
</template>

<style scoped></style>
