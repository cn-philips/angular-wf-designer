/// <reference types="node" />
declare var echarts: any;
declare var require: NodeRequire;
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module "*.json" {
  const value: any;
  export default value;
}
