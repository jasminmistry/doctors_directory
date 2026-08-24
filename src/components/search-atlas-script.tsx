const SEARCH_ATLAS_SCRIPT_SRC =
  "https://dashboard.searchatlas.com/scripts/dynamic_optimization.js"

const SEARCH_ATLAS_UUID = "b06bae8e-262f-466c-b3fd-e54e0246fc42"

export function SearchAtlasScript() {
  return (
    <script
      id="sa-dynamic-optimization"
      type="text/javascript"
      data-uuid={SEARCH_ATLAS_UUID}
      src={SEARCH_ATLAS_SCRIPT_SRC}
      {...({
        nowprocket: "",
        "nitro-exclude": "",
      } as Record<string, string>)}
    />
  )
}
