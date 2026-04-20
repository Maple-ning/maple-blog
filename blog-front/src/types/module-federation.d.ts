declare module 'mapleShares/Button' {
  import type { DefineComponent } from 'vue';

  type ButtonVariant = 'solid' | 'outline' | 'ghost';
  type ButtonSize = 'sm' | 'md' | 'lg';
  type ButtonTag = 'button' | 'a';

  interface RemoteButtonProps {
    as?: ButtonTag;
    label?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    href?: string;
    nativeType?: 'button' | 'submit' | 'reset';
  }

  const component: DefineComponent<RemoteButtonProps>;
  export default component;
}

declare module 'mapleShares/Switch' {
  import type { DefineComponent } from 'vue';

  type SwitchSize = 'sm' | 'md';

  interface RemoteSwitchProps {
    checked?: boolean;
    disabled?: boolean;
    size?: SwitchSize;
    title?: string;
  }

  const component: DefineComponent<RemoteSwitchProps>;
  export default component;
}
