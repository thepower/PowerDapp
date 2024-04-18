import React from 'react';
import { SvgIcon } from './typings';

type PaginationArrowProps = SvgIcon & {
  type: 'left' | 'right';
};

/* eslint-disable max-len */
export const PaginationArrow: React.FC<PaginationArrowProps> = (props) => (
  <svg
    {...props}
    transform={props.type === 'left' ? 'scale(-1 1)' : ''}
    width="44"
    height="44"
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9999 21.0002C14.7347 21.0002 14.4804 21.1055 14.2929 21.293C14.1053 21.4805 14 21.7348 14 22C14 22.2652 14.1053 22.5195 14.2929 22.707C14.4804 22.8945 14.7347 22.9998 14.9999 22.9998H26.5846L22.2911 27.291C22.1981 27.384 22.1244 27.4944 22.0741 27.6158C22.0237 27.7373 21.9978 27.8675 21.9978 27.9989C21.9978 28.1304 22.0237 28.2606 22.0741 28.382C22.1244 28.5035 22.1981 28.6138 22.2911 28.7068C22.384 28.7997 22.4944 28.8735 22.6159 28.9238C22.7373 28.9741 22.8675 29 22.999 29C23.1305 29 23.2607 28.9741 23.3821 28.9238C23.5036 28.8735 23.614 28.7997 23.7069 28.7068L29.7062 22.7079C29.7994 22.615 29.8732 22.5047 29.9236 22.3832C29.9741 22.2617 30 22.1315 30 22C30 21.8685 29.9741 21.7383 29.9236 21.6168C29.8732 21.4953 29.7994 21.385 29.7062 21.2921L23.7069 15.2932C23.614 15.2003 23.5036 15.1265 23.3821 15.0762C23.2607 15.0259 23.1305 15 22.999 15C22.8675 15 22.7373 15.0259 22.6159 15.0762C22.4944 15.1265 22.384 15.2003 22.2911 15.2932C22.1981 15.3862 22.1244 15.4965 22.0741 15.618C22.0237 15.7394 21.9978 15.8696 21.9978 16.0011C21.9978 16.1325 22.0237 16.2627 22.0741 16.3842C22.1244 16.5056 22.1981 16.616 22.2911 16.709L26.5846 21.0002H14.9999Z"
        fill="#39393B"
      />
    </g>
  </svg>
);