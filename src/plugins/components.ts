import type { App } from 'vue';
import {
  ProDate,
  ProDateRange,
  ProDateTime,
  ProDateTimeRange,
  ProDigit,
  ProFormList,
  ProInput,
  ProRadioGroup,
  ProRate,
  ProSelect,
  ProUpload,
  create
} from 'pro-naive-ui';

/** pro-naive-ui 支持配置表单的按需加载，所以需要注册 */
export function setupProNaiveComponents(app: App) {
  const proNaive = create({
    components: [
      ProInput,
      ProDigit,
      ProSelect,
      ProRadioGroup,
      ProDate,
      ProDateTime,
      ProRate,
      ProDateRange,
      ProDateTimeRange,
      ProFormList,
      ProUpload
    ]
  });
  app.use(proNaive);
}
