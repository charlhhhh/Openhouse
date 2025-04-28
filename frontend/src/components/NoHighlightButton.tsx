import { Button } from 'antd';
import styled from 'styled-components';

const NoHighlightButton = styled(Button)`
  &:active,
  &:focus,
  &.ant-btn:active,
  &.ant-btn:focus,
  &.ant-btn:focus-visible,
  &:focus-visible {
    background: inherit !important;
    color: inherit !important;
    box-shadow: none !important;
    outline: none !important;
    border: none !important;
  }
`;

export default NoHighlightButton;