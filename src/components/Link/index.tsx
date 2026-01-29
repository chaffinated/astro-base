import { cva, type VariantProps } from 'class-variance-authority';
import { type PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import './styles.css';



const linkVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "text-primary",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "text-secondary",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        'button--default': "bg-primary text-primary-foreground hover:bg-primary/90",
        'button--destructive':
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        'button--outline':
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        'button--secondary':
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        'button--ghost':
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        'button--link': "text-primary underline-offset-4 hover:underline",
      },
      size: {
        text: "inline",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type LinkProps = Omit<React.HTMLAttributes<'a'>, 'children' | 'href'> & {
  to?: string | URL;
  download?: boolean;
  asButton?: boolean;
} & VariantProps<typeof linkVariants>


export function Link(props: PropsWithChildren<LinkProps>) {
  const {
    asButton = false,
    variant = asButton ? 'button--default' : 'default',
    size = 'default',
    to = '#',
    className = '',
    ...attrs
  } = props;
  return (
    <a
      {...attrs as any} 
      href={to.toString()}
      className={cn(linkVariants({ variant, size, className }))}
    >
      { props.children }
    </a>
  );
}
