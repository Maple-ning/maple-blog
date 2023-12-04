import Icon from '@ant-design/icons';

const articleSvg = () => (
  <svg t="1694155423473" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10989" width="25" height="25"><path d="M682.61 398.43H284.52v56.87h398.09v-56.87zM284.52 796.52h398.09v-56.87H284.52v56.87z m0-170.61h511.83v-56.87H284.52v56.87z m682.44-386.772v-11.317h-11.318L739.48 11.658V0.341h-11.317L727.82 0l-0.34 0.341H170.78c-62.84 0-113.74 50.899-113.74 113.74v796.18c0 62.84 50.9 113.739 113.74 113.739h682.44c62.84 0 113.74-50.899 113.74-113.74V243.403l2.104-2.104-2.105-2.16zM739.48 92.072l135.748 135.749H739.48V92.072zM910.09 910.26c0 31.392-25.478 56.87-56.87 56.87H170.78c-31.392 0-56.87-25.478-56.87-56.87V114.081c0-31.392 25.478-56.87 56.87-56.87h511.83V284.691H910.09v625.57z" p-id="10990" fill="currentcolor"></path></svg>
);

const articleIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={articleSvg} {...props} />
);

export default articleIcon;