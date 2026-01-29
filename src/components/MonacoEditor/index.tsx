import { Fragment, useEffect, useRef, useState } from 'react';
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';
import * as monaco from 'monaco-editor';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TSCodeModelType, type TSCodeGetModels, type TSCodeModelLocal } from './validators/tsCode';
import clsx from 'clsx';
// import 'monaco-editor/esm/vs/editor/editor.all.js';


const self = globalThis as any;

if (self.MonacoEditor == null) {
  self.MonacoEnvironment = {
    async getWorker(_workerId: string, label: string): Promise<Worker> {
      switch (label) {
        case 'json': 
          const jsonWorker = (await import('monaco-editor/esm/vs/language/json/json.worker?worker')).default;
          return new jsonWorker();
        case 'css':
          const cssWorker = (await import('monaco-editor/esm/vs/language/css/css.worker?worker')).default;
          return new cssWorker();
        case 'html':
          const htmlWorker = (await import('monaco-editor/esm/vs/language/html/html.worker?worker')).default;
          return new htmlWorker();
        default:
          const worker = (await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')).default;
          return new worker();
      }
    },
  };
}


export enum MonacoEditorLanguage {
  typescript = 'typescript',
  json = 'json',
  css = 'css',
  html = 'html',
};

type MonacoEditorProps = {
  id: string;
  language?: MonacoEditorLanguage;
  initialValue?: string;
  showControls?: boolean;
  className?: string;
  onSave?: (value: string) => Promise<any>;
  onChange?: (value: string) => any;
  onCancel?: () => Promise<any>;
  onBlur?: () => any;
  onMount?: (m: typeof monaco) => ReturnType<TSCodeGetModels>;
  disabled?: boolean;
};


export function MonacoEditor(props: MonacoEditorProps) {
  const {
    id,
    language = 'typescript',
    initialValue,
    className,
    onSave,
    onChange,
    onCancel,
    onBlur,
    onMount,
    disabled,
    showControls = false,
  } = props;

  let container: HTMLDivElement | null = null;
  let el: HTMLDivElement | null = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let disposables: monaco.IDisposable[] = [];

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<monaco.editor.IMarker[]>([]);

  function onResize() {
    if (editor == null || container == null) return;
    const rect = container.getBoundingClientRect();
    editor.layout(rect);
  }

  async function handleSave() {
    if (editor == null || onSave == null) return;
    const model = editor.getModel();
    const lang = model?.getLanguageId();
    const markers = monaco.editor.getModelMarkers({ owner: lang, resource: model?.uri });
    setErrors(markers);
    const value = editor.getValue();
    setIsSaving(true);
    await onSave(value);
    setIsSaving(false);
  }

  async function handleCancel() {
    if (props.onCancel == null) return;
    await props.onCancel();
  }
  
  function handleChange(e?: monaco.editor.IModelContentChangedEvent) {
    if (props.onChange == null || editor == null) return;
    props.onChange(editor.getValue());
  }
  
  function handleBlur(e: void) {
    if (props.onBlur == null || editor == null) return;
    props.onBlur();
  }

  useEffect(() => {
    const onMount = async () => {
      if (el == null) return;
  
      const models = await props.onMount?.(monaco) || {
        main: {
          type: TSCodeModelType.LOCAL,
          content: props.initialValue || '',
          path: '',
        } as TSCodeModelLocal
      };
  
      const model = models.main
        ? monaco.editor.createModel(models.main.content, props.language || 'typescript', monaco.Uri.parse(`inmemory://model/${models.main.path}`))
        : undefined;
  
      if (models.extra) {
        for (const model of models.extra) {
          try {
            switch(model.type) {
              case TSCodeModelType.LOCAL:
                const path = `inmemory://model/${model.path}`;
                const localDisp = monaco.editor.createModel(model.content, 'typescript', monaco.Uri.parse(path));
                disposables.push(localDisp);
                break;
              case TSCodeModelType.REMOTE:
                const txt = await (await fetch(model.uri)).text();
                const uriSegments = model.uri.split('/');
                const fileName = uriSegments.pop();
                const p = `inmemory://model/node_modules/${model.path}/${fileName}`;
                const disp = monaco.typescript.typescriptDefaults.addExtraLib(txt, p);
                disposables.push(disp);
                break;
              default:
                break;
            }
          } catch (err) {
            console.warn('[tsCode]', '[dependencies]', model, err);
          }
        }
      }
  
      editor = monaco.editor.create(el, {
        language: props.language || 'typescript',
        value: props.initialValue,
        theme: 'vs-dark',
        automaticLayout: true,
        tabSize: 2,
        model,
      });
  
      const autoTypings = await AutoTypings.create(editor, {
        sourceCache: new LocalStorageCache(),
      });
  
      disposables.push(autoTypings);
  
      const formatDoc = editor.getAction('editor.action.formatDocument');
      formatDoc?.run()
      
      // const m = editor.getModel();
      editor.onDidChangeModelContent(handleChange);
      editor.onDidBlurEditorWidget(handleBlur);
  
      setIsLoading(false);
      globalThis.addEventListener('resize', onResize);
      setTimeout(() => onResize(), 500);
    }

    onMount();

    return () => {
      globalThis.removeEventListener('resize', onResize);
      editor?.dispose();
      disposables?.forEach((dis) => dis.dispose());
    };
  }, []);

  useEffect(() => {
    const v = editor?.getValue();
    if (v || !initialValue || v === initialValue) return;
    editor?.setValue(initialValue);
    handleChange();
  }, [initialValue]);

  return (
    <div
      className={clsx(className, {
        relative: true,
        'pointer-events-none': props.disabled,
      })}
      ref={(e) => { container = e }}
    >
      <div
        id={props.id}
        ref={(e) => { el = e }}
        // class='pb-20'
      >
        { isLoading
          ? <div className='bg-neutral-700 h-80'>
              <Spinner className="size-16" />
            </div>
          : null
        }
      </div>
      
      { showControls
        ? <div className='absolute bottom-0 w-full flex flex-row justify-end p-3 bg-white'>
            <Button
              variant='outline'
              className='mr-2'
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        : null
      }

      { isSaving
        ? <div className='absolute top-0 w-full h-full flex justify-center items-center'>
            <Spinner className="size-16" />
          </div>
        : null
      }
    </div>
  );
}

/* === FIELD === */
type FieldChangeEvent = Event & { currentTarget: FieldElement; target: Element; };

type MonacoEditorFieldProps = Omit<MonacoEditorProps, 'onChange' | 'onBlur'> & {
  name: string;
  label?: string;
  error?: string;
  onChange?: (e: FieldChangeEvent) => any;
  onBlur?: JSX.EventHandler<FieldElement, FocusEvent>;
  onInput?: JSX.EventHandler<FieldElement, InputEvent>;
  disabled?: boolean;
  initialValue?: string;
}

export function MonacoEditorField(props: MonacoEditorFieldProps) {
  const {
    className,
    onChange,
    onBlur,
    onInput,
  } = props;
  const [value, setValue] = useState(props.initialValue || '');
  let input = useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx({
        'opacity-75': props.disabled,
      })}
    >
      <input
        type='hidden'
        value={value}
        name={props.name}
        ref={input}
        onChange={onChange}
        onBlur={onBlur}
        onInput={onInput}
      />
      <Text variant='label'>
        { props.label }
      </Text>
      
      <div
        className={clsx({
          'h-80': true,
          'pointer-events-none': props.disabled,
        })}
      >
        <MonacoEditor
          {...props}
          className={className}
          onChange={(val) => {
            if (input.current == null) return;
            const changeEvent = new Event('change', { bubbles: true });
            const inputEvent = new Event('input', { bubbles: true });
            setValue(val);
            input.current.dispatchEvent(changeEvent);
            input.current.dispatchEvent(inputEvent);
          }}
          onBlur={() => {
            if (input.current == null) return;
            const blurEvent = new Event('blur');
            input.current.dispatchEvent(blurEvent);
          }}
        />
      </div>

      <Text variant='label' className='text-red-600'>
        { props.error?.split('\n').map((item) => {
          return (
            <Fragment key={item}>
              { item }
              <br />
            </Fragment>
          );
        }) }
      </Text>
    </div>
  );
}
