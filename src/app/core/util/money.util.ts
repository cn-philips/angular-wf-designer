import { money_column} from './money.column';

export const isMoneyColumn = (columnName: string) => {
  return money_column.indexOf(columnName) > -1;
};
