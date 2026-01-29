import { Suspense, type PropsWithChildren } from 'react';
import remarkBreaks from 'remark-breaks';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { clsx } from 'clsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/components/Link';
import { useI18n } from '@/services/i18n';
import './styles.css';


export const tagName = 'tw-text';

type TextVariants =
  'h1' |
  'h2' |
  'h3' |
  'h4' |
  'h5' |
  'h6' |
  'p' |
  'span' |
  'label' |
  'caption';

type IntrinsicAttributes = React.HTMLAttributes<HTMLHeadingElement | HTMLElement>;

export type TextProps = IntrinsicAttributes & {
  variant?: TextVariants;
  i18n?: { key: string, values?: Record<string, any> };
  className?: string;
  for?: string;
}

function TextRaw(props: PropsWithChildren<TextProps>) {
  const {
    variant = 'span',
    className = '',
    i18n: i18nProp,
    // children,
    ...attrs
  } = props;
  const C = variant;
  const i18n = useI18n();

  const t = i18nProp
    ? i18n.t(i18nProp.key, { defaultValue: props.children, ...(i18nProp.values || {} ) })
    : null;
  const children = t
    ? <Markdown
        disallowedElements={['p']}
        unwrapDisallowed
        rehypePlugins={[
          rehypeRaw,
        ]}
        remarkPlugins={[
          remarkBreaks,
        ]}
        components={{
          h1: (props) => <Text {...props} variant='h1' />,
          h2: (props) => <Text {...props} variant='h2' />,
          h3: (props) => <Text {...props} variant='h3' />,
          h4: (props) => <Text {...props} variant='h4' />,
          h5: (props) => <Text {...props} variant='h5' />,
          h6: (props) => <Text {...props} variant='h6' />,
          p: (props) => <Text {...props} variant='p' />,
          span: (props) => <Text {...props} variant='span' />,
          label: (props) => <Text {...props} variant='label' />,
          caption: (props) => <Text {...props} variant='caption' />,
          a: (props) => <Link {...props as any} size="text" to={props.href} />
        }}
      >
        { t }
      </Markdown>
    : props.children;

  return (
    <C
      {...attrs}
      className={clsx('text', className)}
    >
      { children }
    </C>
  );
}


export function Text(props: TextProps) {
  return (
    <Suspense fallback={<Skeleton className="h-4 w-full" />}>
      <TextRaw {...props} />
    </Suspense>
  )
}
