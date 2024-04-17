// these are references to firebase config files (that contain secrets) that live in the EAS build environment

export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      googleServicesFile: process.env.ANDROID_FILE_SECRET,
    },
    ios: {
      ...config.ios,
      googleServicesFile: process.env.IOS_FILE_SECRET,
    },
  };
};
