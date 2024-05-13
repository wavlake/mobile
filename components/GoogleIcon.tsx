import Svg, { Path, SvgProps } from "react-native-svg";

export const GoogleIcon = (props: SvgProps) => {
  return (
    <Svg height="30px" width="30px" viewBox="0 1 30 30" {...props}>
      <Path d="M15 13H25V17H15z" />
      <Path d="M22.733,13C22.899,13.641,23,14.307,23,15c0,4.418-3.582,8-8,8s-8-3.582-8-8s3.582-8,8-8c2.009,0,3.84,0.746,5.245,1.969l2.841-2.84C20.952,4.185,18.116,3,15.003,3C8.374,3,3,8.373,3,15s5.374,12,12.003,12c10.01,0,12.266-9.293,11.327-14H22.733z" />
    </Svg>
  );
};
