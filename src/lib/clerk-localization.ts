import { trTR } from "@clerk/localizations/tr-TR";

/** Clerk arayüzü — Türkçe + ParselOS terimleri */
export const parselClerkLocalization = {
  ...trTR,
  userButton: {
    ...trTR.userButton,
    action__manageAccount: "Üyelik Paneli",
    action__signOut: "Çıkış Yap",
  },
  userProfile: {
    ...trTR.userProfile,
    navbar: {
      ...trTR.userProfile?.navbar,
      title: "Hesap",
      description: "Profil ve güvenlik ayarlarınız",
      account: "Hesap",
      security: "Güvenlik",
    },
  },
};
