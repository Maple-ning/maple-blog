import Icon from '@ant-design/icons';

const aboutMeSvg = () => (
  <svg t="1694155792534" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17367" width="25" height="25"><path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zM512 960c-249.6 0-448-198.4-448-448 0-249.6 198.4-448 448-448s448 198.4 448 448C960 761.6 761.6 960 512 960z" fill="currentcolor" p-id="17368"></path><path d="M512 160C390.4 160 288 262.4 288 384S390.4 608 512 608s224-102.4 224-224S633.6 160 512 160zM512 544C422.4 544 352 473.6 352 384c0-89.6 70.4-160 160-160s160 70.4 160 160C672 473.6 601.6 544 512 544z" fill="currentcolor" p-id="17369"></path><path d="M204.8 851.2C236.8 710.4 364.8 608 512 608s275.2 102.4 307.2 243.2l64 0c-38.4-172.8-192-307.2-377.6-307.2s-339.2 128-377.6 307.2L204.8 851.2z" fill="currentcolor" p-id="17370"></path></svg>
)

const aboutMeIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={aboutMeSvg} {...props} />
);

export default aboutMeIcon;