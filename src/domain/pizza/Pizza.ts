import { Size } from './Size';

export interface Pizza {
  readonly label: string;
  readonly size: Size;
  price(): number;
  withSize(size: Size): Pizza;
}
