import Svg, { Path, SvgProps } from "react-native-svg";

export const PauseRoundIcon = (props: SvgProps) => {
  return (
    <Svg width="275px" height="275px" viewBox="2 2 20 20" {...props}>
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM9 9v6h2V9H9zm4 0v6h2V9h-2z" />
    </Svg>
  );
};
