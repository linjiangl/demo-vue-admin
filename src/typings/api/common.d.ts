/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'> & {
      id: string;
      created_at: [string, string];
      sorting: string;
    };

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record create time */
      created_at: string;
      /** record updater */
      updated_at: string;
      /** record status */
      status: number;
    } & T;

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
