declare namespace Api {
  namespace Upload {
    type UploadConfig = {
      method: string;
      url: string;
      name: string;
      form: Record<string, string>;
      allow_ext: string;
      allow_mime: string;
      max_size: number;
    };

    type UploadFileResponse = {
      url: string;
      filename: string;
      key: string;
      size: number;
      mime: string;
    };
  }
}
