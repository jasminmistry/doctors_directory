import { attributionParams, track, trackOnce } from "@/lib/analytics/track"
import { ATTR_COOKIE_NAME, serializeAttrCookie } from "@/lib/attribution"

describe("track", () => {
  const originalGtag = window.gtag
  const originalDL = window.dataLayer

  afterEach(() => {
    window.gtag = originalGtag
    window.dataLayer = originalDL
  })

  test("pushes to dataLayer and calls gtag with cleaned params", () => {
    const gtag = jest.fn()
    window.gtag = gtag as unknown as typeof window.gtag
    window.dataLayer = []

    track("sign_up_start", { entity_type: "clinic", source_bucket: null, mode: "" })

    expect(gtag).toHaveBeenCalledWith("event", "sign_up_start", { entity_type: "clinic" })
    expect(window.dataLayer).toEqual([{ event: "sign_up_start", entity_type: "clinic" }])
  })

  test("never throws when gtag is absent", () => {
    window.gtag = undefined
    window.dataLayer = undefined
    expect(() => track("sign_up", { plan: "free" })).not.toThrow()
  })

  test("trackOnce fires once per key, then suppresses", () => {
    const gtag = jest.fn()
    window.gtag = gtag as unknown as typeof window.gtag
    window.dataLayer = []
    window.sessionStorage.clear()

    trackOnce("sign_up:42", "sign_up", { plan: "free" })
    trackOnce("sign_up:42", "sign_up", { plan: "free" })
    trackOnce("sign_up:43", "sign_up", { plan: "subscription" })

    expect(gtag).toHaveBeenCalledTimes(2)
  })
})

describe("attributionParams", () => {
  afterEach(() => {
    document.cookie = `${ATTR_COOKIE_NAME}=; Max-Age=0; Path=/`
  })

  test("reads source and landing page from the dd_attr cookie", () => {
    const value = serializeAttrCookie({
      source: "blog",
      landingPage: "/blog/x",
      referrer: "google.com",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    })
    document.cookie = `${ATTR_COOKIE_NAME}=${value}; Path=/`

    expect(attributionParams()).toEqual({ source_bucket: "blog", landing_page: "/blog/x" })
  })

  test("returns nulls when the cookie is missing", () => {
    expect(attributionParams()).toEqual({ source_bucket: null, landing_page: null })
  })
})
