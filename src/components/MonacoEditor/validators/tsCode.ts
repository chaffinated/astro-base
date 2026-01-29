import type { BaseSchemaAsync } from 'valibot';
import * as monaco from 'monaco-editor';

export enum TSCodeModelType {
  REMOTE = 'remote',
  LOCAL = 'local',
}

export type TSCodeModelRemote = {
  type: TSCodeModelType.REMOTE;
  uri: string;
  path: string;
};

export type TSCodeModelLocal = {
  type: TSCodeModelType.LOCAL;
  content: string;
  path: string;
};

export type TSCodeModel = TSCodeModelRemote | TSCodeModelLocal;

export type TSCodeGetModels = (m: typeof monaco, ...args: any[]) => Promise<{
  main: TSCodeModelLocal | null;
  extra?: TSCodeModel[];
  // disposables?: monaco.IDisposable[];
}>;

export interface TSCodeOptions {
  getModels: TSCodeGetModels;
  disabled?: boolean | ((...args: any[]) => boolean);
}

export interface TSCodeSchema extends BaseSchemaAsync<string, { [key: string]: any }> {
  schema: 'tsCode';
  disabled: boolean | ((...args: any[]) => boolean);
  getModels: TSCodeGetModels;
}

export const tsCode = (message: string, options: TSCodeOptions): TSCodeSchema => {
  const disabled = options?.disabled == null
    ? false
    : options.disabled;
  
  async function _parse(input: string): Promise<any> {
    if (typeof input !== 'string' || input.length === 0) {
      return {
        issues: [{
          validation: 'tsCode',
          input,
          message: message || `Code is required`,
          reason: 'type',
          origin: 'value',
        }],
      };
    }
    return {
      output: input,
    };
  }

  async function getModels(m: typeof monaco, formValues: any) {
    const ts = m.languages.typescript;
    const models = await options.getModels(m, formValues);

    ts.typescriptDefaults.setCompilerOptions({
      ...ts.typescriptDefaults.getCompilerOptions(),
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    });

    return models;
  }

  return {
    schema: 'tsCode',
    async: true,
    _parse,
    disabled,
    getModels,
  };
}
