export type ARAConfig = {
  clean?: Array<string>;
  update?: {
    exclude?: Array<string>;
    force?: boolean;
    install?: boolean;
    write?: boolean;
  };
};

export type ARAConfigPath = {
  locations: Array<string>;
  names: Array<string>;
  extensions: Array<string>;
};