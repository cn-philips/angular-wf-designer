export interface Dict {
  group?: string;
  sort?: number;
  code?: string;
  label?: string;
  tag?: string;
  value?: string;
  class?: string;
  type?: string;
}

export interface ApiDict {
  dictGroup?: string;
  dictSort?: number;
  dictId?: string;
  dictLabel?: string;
  dictValue?: string;
  dictKey?: string;
  listClass?: string;
  dictType?: string;
}
