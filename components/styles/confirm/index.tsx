import tw from 'tailwind-styled-components';

export { default as Container } from './Container';

export const InputStyleContainer = tw.div`items-center flex rounded-md justify-between p-1 w-full gap-1 align-middle border dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
export const InputStyle = tw.div`my-1 ml-3 h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none`;
export const InputsWrap = tw.div`w-full flex flex-col gap-1 my-5`;
export const DetailsWrap = tw.div`grid w-full p-2 gap-2`;
export const DetailWrap = tw.div`justify-between flex`;
export const Detail = tw.div`text-sm dark:text-gray-50 text-gray-900`;
export const DetailGray = tw.div`italic dark:text-gray-300 text-gray-600 text-sm`;
export const Italic = tw.div`italic text-xs dark:text-gray-300 text-gray-800`;
export const LineBreak = tw.div`w-full h-[1px] bg-gray-700`;
export const Flex = tw.div`flex`;
export const DisclaimerTextWrap = tw.div`my-3 text-center`;
export const AssetSelectWrap = tw.div`min-w-fit p-1 dark:text-gray-50`;
export const Right = tw.div`flex float-right`;
