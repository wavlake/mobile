import Svg, { Path, SvgProps } from "react-native-svg";

export const ArtistsIcon = (props: SvgProps) => {
  return (
    <Svg x="0px" y="0px" viewBox="0 0 120 120" {...props}>
      <Path d="M59.96 86.19c-6 0-12-.02-18 .01-1.6.01-2.78-.71-3.77-1.84-.75-.86-1.06-1.91-1.17-3.04-.33-3.37.38-6.55 1.69-9.62 2.36-5.56 6.37-9.54 11.81-12.11.4-.19.42-.23.08-.53-2.1-1.81-3.59-4.02-4.44-6.67-2.01-6.2.59-13.2 6.16-16.6 2.67-1.63 5.57-2.36 8.67-2.11 7.19.59 12.24 5.95 13.14 12.03.65 4.38-.34 8.3-3.16 11.74-.5.61-1.07 1.15-1.68 1.65-.28.23-.26.33.07.46 2.19.91 4.17 2.17 5.91 3.76 3.56 3.25 6.05 7.18 7.18 11.9.54 2.24.72 4.52.36 6.82-.3 1.93-1.9 3.58-3.81 4.12-.17.05-.37.03-.56.03H59.96z" />
    </Svg>
  );
};
