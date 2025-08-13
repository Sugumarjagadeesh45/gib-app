// react-native-version-check.d.ts
declare module 'react-native-version-check' {
  const VersionCheck: {
    getLatestVersion: () => Promise<string>;
    getPackageName: () => string;
    getCurrentVersion: () => string;
    getStoreUrl: (options?: { packageName?: string }) => string;
    needUpdate: (params: {
      currentVersion: string;
      latestVersion: string;
    }) => boolean;
  };

  export default VersionCheck;
}
