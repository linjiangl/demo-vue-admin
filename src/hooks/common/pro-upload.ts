import { computed, ref } from 'vue';
import type { UploadFileInfo, UploadProps } from 'naive-ui';
import { fetchUploadConfig } from '@/service/api';

/**
 * 将后端返回的文件路径批量转换为 UploadFileInfo 格式
 * @param filePaths - 文件路径数组
 * @param fileUrls - 文件访问地址数组
 * @returns UploadFileInfo 对象数组
 */
export function createFileInfos(filePaths: string[], fileUrls: string[]): UploadFileInfo[] {
  const fileInfos: UploadFileInfo[] = [];

  filePaths.forEach((path, index) => {
    if (path) {
      fileInfos.push({
        id: path,
        name: path.split('/').pop() || 'file',
        fullPath: path,
        url: fileUrls[index] || '',
        status: 'finished'
      });
    }
  });

  return fileInfos;
}

/**
 * 将上传组件的文件值转换为提交格式
 * @param files - 文件数组
 * @param multiple - 是否多文件
 * @returns 文件路径字符串或数组
 */
export function getUploadFileValue(files: UploadFileInfo[], multiple = false): string | string[] {
  if (files.length <= 0) return multiple ? [] : '';

  const processedFiles = files.map(file => file.fullPath || '').filter(Boolean);
  return multiple ? processedFiles : processedFiles[0] || '';
}

/**
 * 生成 ProUpload 组件的上传配置
 * @param uploadConfig - 上传配置对象
 * @returns ProUpload field-props
 */
function getUploadConfigProps(uploadConfig: Api.System.UploadConfig): UploadProps {
  return {
    action: uploadConfig.url,
    method: uploadConfig.method as 'POST',
    name: uploadConfig.name,
    data: uploadConfig.form,
    onFinish: ({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) => {
      const response = JSON.parse((event?.target as XMLHttpRequest).response);

      file.name = response.data?.filename;
      file.url = response.data?.url;
      file.fullPath = response.data?.key;
      return file;
    }
  };
}

/**
 * 上传组件 Hook
 * @returns 上传配置和相关方法
 *
 * @example
 * ```ts
 * const { uploadProps, initUploadConfig } = useProUpload();
 *
 * onMounted(async () => {
 *   await initUploadConfig();
 * });
 *
 * // template
 * // <ProUpload :field-props="{ ...uploadProps }" />
 * ```
 */
export function useProUpload() {
  const uploadConfig = ref<Api.System.UploadConfig | null>(null);

  async function initUploadConfig() {
    const { data } = await fetchUploadConfig();
    if (data) {
      uploadConfig.value = data;
    }
  }

  const uploadProps = computed(() => {
    if (!uploadConfig.value) return {};
    return getUploadConfigProps(uploadConfig.value);
  });

  return {
    /** 上传配置对象 */
    uploadConfig,
    /** 上传属性配置 */
    uploadProps,
    /** 初始化上传配置 */
    initUploadConfig
  };
}
