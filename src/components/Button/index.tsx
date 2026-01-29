import { Button as RawButton, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';


type ButtonProps = React.ComponentProps<"button">
  & VariantProps<typeof buttonVariants>
  & {
    asChild?: boolean;
  }
  & {
    isLoading?: boolean;
  };

export function Button(props: ButtonProps) {
  const { isLoading, children, ...rest } = props;

  return (
    <RawButton {...rest}>
      <Spinner
        className={cn('transition-all', {
          'size-0': !isLoading,
          'size-4': isLoading,
        })}
      />
      { children }
    </RawButton>
  );
}
