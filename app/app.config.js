const projectId = "03ebe280-ec86-4b90-be02-967f59678b97";

const variants = {
  development: {
    name: "Koala Habit Dev",
    scheme: ["koalahabit-dev", "exp+koala-habit"],
    iosBundleIdentifier: "com.globjoy.koalahabit.dev",
    androidPackage: "com.globjoy.koalahabit.dev"
  },
  preview: {
    name: "Koala Habit Preview",
    scheme: ["koalahabit-preview", "exp+koala-habit"],
    iosBundleIdentifier: "com.globjoy.koalahabit.preview",
    androidPackage: "com.globjoy.koalahabit.preview"
  },
  production: {
    name: "Koala Habit",
    scheme: ["koalahabit", "exp+koala-habit"],
    iosBundleIdentifier: "com.globjoy.koalahabit",
    androidPackage: "com.globjoy.koalahabit"
  }
};

module.exports = ({ config }) => {
  const variantName = process.env.APP_VARIANT ?? "production";
  const variant = variants[variantName] ?? variants.production;

  return {
    ...config,
    name: variant.name,
    scheme: variant.scheme,
    extra: {
      ...(config.extra ?? {}),
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      appVariant: variantName,
      eas: {
        projectId
      }
    },
    ios: {
      ...(config.ios ?? {}),
      bundleIdentifier: variant.iosBundleIdentifier
    },
    android: {
      ...(config.android ?? {}),
      package: variant.androidPackage
    }
  };
};
