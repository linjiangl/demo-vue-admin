declare namespace Api {
  namespace Stat {
    interface Statistic {
      user_register: number;
      user_destroy: number;
      user_authorize: number;
      active_app: number;
      active_wap: number;
    }

    interface StatisticDaily extends Statistic {
      id: number;
      date: string;
      created_at: string;
      updated_at: string;
    }

    interface StatisticSubtotal {
      subtotal: Statistic;
      today: Statistic;
      yesterday: Statistic;
      attachment: {
        num: number;
        size: number;
      };
    }
  }
}
