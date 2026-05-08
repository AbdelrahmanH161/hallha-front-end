/** Best-effort ISO-3166 alpha-2 lowercase from browser locale (matches `auth.register.step2.countries` values). */
export function inferCountryCodeFromLocale(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions() as Intl.ResolvedDateTimeFormatOptions & {
      region?: string
    }
    const region = resolved.region
    if (!region) return ""
    const upper = region.toUpperCase()
    const map: Record<string, string> = {
      AE: "ae",
      SA: "sa",
      KW: "kw",
      BH: "bh",
      QA: "qa",
      OM: "om",
      JO: "jo",
      LB: "lb",
      IQ: "iq",
      PS: "ps",
      EG: "eg",
      MA: "ma",
      DZ: "dz",
      TN: "tn",
      LY: "ly",
      SD: "sd",
      MR: "mr",
      YE: "ye",
      DJ: "dj",
      SO: "so",
      PK: "pk",
      BD: "bd",
      MV: "mv",
      ID: "id",
      MY: "my",
      TR: "tr",
      IR: "ir",
      NG: "ng",
      SN: "sn",
      GB: "uk",
      US: "us",
    }
    return map[upper] ?? region.toLowerCase()
  } catch {
    return ""
  }
}
