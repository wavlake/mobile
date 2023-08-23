import Svg, { Path, SvgProps } from "react-native-svg";

export const FireIcon = (props: SvgProps) => {
  return (
    <Svg x="0px" y="0px" viewBox="0 0 2000 2000" {...props}>
      <Path d="M971.2 1719h-24.3c-.9-.5-1.8-.4-2.8-.5-3.3-.1-6.6-.2-9.9-.4-6.3-.5-12.5-.8-18.8-1.6-4.3-.6-8.7-.9-13-1.6-7.1-1-14.1-2.2-21.1-3.7-9-1.9-17.9-4-26.6-6.9-1-.3-2-.6-3.1-.9-11.8-3-23.4-6.4-34.8-10.5-6.1-2.2-12.2-4.5-18.3-6.8-27.3-10.2-53.6-22.6-78.7-37.3-24.2-14.2-47.1-30.3-68.9-48-54.4-44.1-99-96.7-133.8-157.4-27.6-48.2-47.7-99.4-61.3-153.2-2.8-11.3-5.3-22.6-7.5-34-1-5.7-1.9-11.3-2.8-17-.6-3.8-1.1-7.6-1.6-11.4-.5-4.1-1-8.2-1.4-12.4-.4-3.5-.6-7-.9-10.5-.6-6.7-1-13.4-1.1-20.1 0-1.8 0-3.6-.1-5.4-.1-2.2-.3-4.5-.5-6.7 0-.6-.3-1.1-.8-1.6.1-1.2.1-1.8.1-3 .5-.5.6-1.1.7-1.8.2-3.2.4-6.4.5-9.6l.3-9.9c.3-4.5.6-8.9 1-13.4.5-5.3.9-10.6 1.5-15.9.8-6.9 1.8-13.7 2.9-20.6 1.4-8.7 3-17.4 4.8-26.1 3-14.4 6.5-28.7 10.3-42.9 4-14.9 8.1-29.8 12.1-44.7 4.9-18.4 9.5-36.9 12.7-55.8.8-4.7 1.5-9.5 2.2-14.2.7-5 1.2-10 1.6-15 .5-6.3.9-12.5 1-18.8.2-11.2-.4-22.4-1.7-33.5-.8-7.4-2-14.8-3.5-22.1-3.1-15.2-7.5-30-13-44.5-2.7-7.2-5.7-14.3-8.8-21.2-.4-.9-.8-1.8-1.1-2.6-.1-.4 0-1 .3-1.1.6-.3 1.1-.6 1.7-.8 14.8-6.2 30.1-10.7 46.1-12.5 5.6-.6 11.3-1 16.9-.9 2.3 0 4.7.2 7 .3 4.5.2 8.9.8 13.3 1.6 14.5 2.6 28.1 7.5 41 14.7 8.4 4.7 16.2 10.2 23.6 16.4 10.3 8.6 19.4 18.2 27.7 28.7 6.4 8 12.2 16.4 17.7 25.1.5.8 1 1.6 1.6 2.4.1.1.4.1.6.1 0 0 .1-.2.1-.3 0-.7.1-1.5 0-2.2-.2-6.2-.5-12.4-.7-18.5-.2-9.1-.2-18.1-.3-27.2 0-13.7.3-27.3.9-40.9.2-3.8.4-7.7.7-11.5.2-3.3.4-6.6.7-9.9.5-5.8 1-11.7 1.6-17.5.5-4.8.9-9.5 1.5-14.3.9-7 1.9-13.9 2.9-20.9 1.1-8.1 2.6-16.2 4.1-24.3 2.3-12.2 5.1-24.4 8.2-36.5 5.5-21.4 12.3-42.4 20.4-62.9 10.5-26.4 23.2-51.7 38.4-75.7 32.5-51.2 74.3-93.2 125.6-125.6 41.9-26.4 87-44.9 135.4-55.2 6.4-1.4 12.8-2.4 19.2-3.3.7-.1 1.5-.1 2.2-.1.1 0 .2.1.2.2s.1.2.1.3c-.3.4-.7.8-1 1.2-2.7 2.6-5.2 5.3-7.7 8.1-12.7 15-22.1 31.8-28.5 50.4-3.3 9.7-5.7 19.6-7.2 29.8-.8 5.6-1.4 11.2-1.6 16.9-.5 11.7 0 23.4 1.7 35.1 1.1 7.7 2.5 15.3 4.4 22.9 2.3 9.3 5.1 18.5 8.2 27.6 8.4 24.8 19.2 48.5 32 71.4 7.9 14 16.5 27.7 25.4 41 8 12 16.3 23.7 24.5 35.5 6.2 8.8 12.3 17.7 18.4 26.5.5.7 1 1.3 1.6 2 .1.1.4 0 .7 0 .3-.9.6-1.8.8-2.7 3.4-11.1 7.1-22.1 11.4-32.9 6.6-16.6 14.4-32.6 23.8-47.7 8.9-14.4 19.1-27.8 30.9-39.8 21.7-22.2 47.3-38.3 76.9-47.7 9.6-3 19.3-5.3 29.2-6.8 3.6-.5 7.2-1 10.8-1.4 4.7-.5 9.3-.8 14-.9 11-.4 21.9.2 32.8 1.6 5.3.7 10.5 1.6 15.7 2.8.7.2 1.4.5 2.1.7-.1.8-.7 1.2-1.1 1.6-4 3.8-7.7 7.9-11.2 12.3-13.2 16.7-22.6 35.3-28.3 55.8-2.6 9.2-4.3 18.5-5.2 27.9-.6 6-1 12.1-1 18.2.1 9.7.8 19.4 2.2 29 1.2 8.1 2.9 16.2 5 24.1 6 22.3 14.1 43.8 24.4 64.5 6.3 12.7 13.4 25 20.9 37 5.8 9.3 11.7 18.6 17.5 27.9 6.7 10.8 13.1 21.7 19 33 9.1 17.7 16.5 36 21.9 55.2 2.6 9.2 4.8 18.6 6.5 28 1.1 5.8 2.1 11.5 2.8 17.4.5 4.1 1.1 8.2 1.6 12.4.3 2.7.6 5.3.8 8 .3 3.8.6 7.7.9 11.5.6 7.5 1 15.1 1.1 22.7.2 11.1.3 22.2.1 33.3 0 .6 0 1.3.1 1.9 0 .1.1.2.2.2.2-.1.4-.1.5-.3l.6-1.5c3.2-10 7-19.9 11.5-29.5 5.7-12.2 12.5-23.8 20.6-34.5 7.9-10.4 16.9-19.8 27.3-27.7 8.5-6.5 17.7-11.8 27.6-15.9.7-.3 1.4-.6 2.1-.8.5-.2 1 .1 1.2.7.1.4.2.8.4 1.2.6 2.4 1.3 4.7 1.9 7.1 4.6 17.6 8.5 35.4 12 53.3 2.9 14.6 5.4 29.3 7.7 44.1 1.3 8.3 2.3 16.7 3.5 25 1 7.1 1.8 14.2 2.5 21.3.2 2.4.5 4.9.8 7.3.3 3.2.7 6.4 1 9.6l.9 10.5 1.2 15.9c.3 4.4.5 8.7.8 13.1.2 2.9.3 5.8.4 8.6.1 5.3.2 10.7.2 16 0 1.2.2 2.3.5 3.4v38.4c-.4 1.3-.5 2.7-.5 4.1 0 3.9-.2 7.9-.2 11.8 0 6.2-.6 12.3-.8 18.5 0 .3-.1.6-.1 1-.3 4-.6 8.1-1 12.1-.3 3.3-.5 6.6-.9 9.9-.7 6.5-1.4 12.9-2.3 19.4-.9 6.7-1.8 13.3-2.8 19.9-1.6 9.7-3.4 19.3-5.4 28.9-4.1 19.2-9.2 38.1-15.5 56.7-7.8 23.1-17.5 45.3-29.3 66.6-11.1 20-23.1 39.3-36.2 58-21.1 30-44.6 57.9-71 83.4-37.2 36-78.6 66-124.3 90.2-40.1 21.3-82.1 37.4-125.9 49.3-8.9 2.4-17.9 4.7-26.9 7-14.6 3.9-29.4 7.2-44.3 9.8-8.5 1.5-17 2.8-25.6 3.8-2.3.3-4.6.6-7 .8-3.3.3-6.6.7-9.9 1-3.7.3-7.4.5-11.2.8-.4 0-.8.1-1.3.1-3.5.3-7 .7-10.5.9-5.7.4-11.5.8-17.2.9-.6 0-1.3 0-1.9.1-.1-.3-.5-.1-.9 0z" />
    </Svg>
  );
};
