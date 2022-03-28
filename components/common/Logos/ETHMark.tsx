import * as React from 'react';

function ETHMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%">
      <path
        d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z"
        fill="#627EEA"
        fillOpacity="0.12"
      ></path>
      <g clipPath="">
        <g opacity="0.8">
          <path
            opacity="0.6"
            d="M28.3072 22.7783L16.037 28.3587L28.3072 35.608L40.5726 28.3587L28.3072 22.7783Z"
            fill="#627EEA"
          ></path>
        </g>
        <g opacity="0.65">
          <path opacity="0.45" d="M16.037 28.3587L28.3072 35.608V8.00002L16.037 28.3587Z" fill="#627EEA"></path>
        </g>
        <path opacity="0.8" d="M28.3072 8.00002V35.608L40.5725 28.3587L28.3072 8.00002Z" fill="#627EEA"></path>
        <g opacity="0.65">
          <path opacity="0.45" d="M16.037 30.6835L28.3072 47.9698V37.9327L16.037 30.6835Z" fill="#627EEA"></path>
        </g>
        <path opacity="0.8" d="M28.3072 37.9327V47.9698L40.5822 30.6835L28.3072 37.9327Z" fill="#627EEA"></path>
      </g>
    </svg>
  );
}

export default ETHMark;
