import React from 'react';
import { SvgIcon } from './typings';
/* eslint-disable max-len */
export const ParkIcon: React.FC<SvgIcon> = (props) => (
  <svg
    {...props}
    width='20'
    height='21'
    viewBox='0 0 20 21'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <mask
      id='mask0_10236_632'
      style={{ maskType: 'luminance' }}
      maskUnits='userSpaceOnUse'
      x='1'
      y='4'
      width='18'
      height='14'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.6665 10.75L3.74984 8.66667L7.9165 12.8333L16.2498 4.5L18.3332 6.58333L7.9165 17L1.6665 10.75Z'
        fill='white'
        stroke='white'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </mask>
    <g mask='url(#mask0_10236_632)'>
      <path d='M0 0.75H20V20.75H0V0.75Z' fill='#1D1D1F' />
    </g>
  </svg>
);
