// Define a union type for string or number
type StringOrNumber = string | number

// =======================
// Media Types
// =======================

/**
 * Interface for media types.
 */
interface MediaTypes {
  all: boolean
  grid: boolean
  aural: boolean
  braille: boolean
  handheld: boolean
  print: boolean
  projection: boolean
  screen: boolean
  tty: boolean
  tv: boolean
  embossed: boolean
}

/**
 * Object containing media types.
 * (Values here are placeholders; adjust them as needed.)
 */
const types: MediaTypes = {
  all: true,
  grid: true,
  aural: true,
  braille: true,
  handheld: true,
  print: true,
  projection: true,
  screen: true,
  tty: true,
  tv: true,
  embossed: true,
}

// =======================
// Media Matchers
// =======================

/**
 * Interface for properties that match media queries.
 */
interface MediaMatchers {
  orientation: 'portrait' | 'landscape'
  scan: 'progressive' | 'interlace'
  aspectRatio: string
  deviceAspectRatio: string
  height: StringOrNumber
  deviceHeight: StringOrNumber
  width: StringOrNumber
  deviceWidth: StringOrNumber
  color: boolean
  colorIndex: boolean
  monochrome: boolean
  resolution: StringOrNumber
  type: string[] // Derived from Object.keys(types)
}

/**
 * Object defining media matchers with example default values.
 */
const matchers: MediaMatchers = {
  orientation: 'portrait',
  scan: 'progressive',
  aspectRatio: '',
  deviceAspectRatio: '',
  height: 0,
  deviceHeight: 0,
  width: 0,
  deviceWidth: 0,
  color: true,
  colorIndex: true,
  monochrome: true,
  resolution: 0,
  type: Object.keys(types),
}

const { ...featureMatchers } = matchers

// =======================
// Media Features
// =======================

/**
 * Interface for media features extending basic matcher properties.
 */
interface MediaFeatures extends Omit<MediaMatchers, 'type'> {
  minAspectRatio: string
  maxAspectRatio: string
  minDeviceAspectRatio: string
  maxDeviceAspectRatio: string
  minHeight: StringOrNumber
  maxHeight: StringOrNumber
  minDeviceHeight: StringOrNumber
  maxDeviceHeight: StringOrNumber
  minWidth: StringOrNumber
  maxWidth: StringOrNumber
  minDeviceWidth: StringOrNumber
  maxDeviceWidth: StringOrNumber
  minColor: number
  maxColor: number
  minColorIndex: number
  maxColorIndex: number
  minMonochrome: number
  maxMonochrome: number
  minResolution: StringOrNumber
  maxResolution: StringOrNumber
}

/**
 * Object containing media features with default (placeholder) values.
 */
const features: MediaFeatures = {
  minAspectRatio: '',
  maxAspectRatio: '',
  minDeviceAspectRatio: '',
  maxDeviceAspectRatio: '',
  minHeight: 0,
  maxHeight: 0,
  minDeviceHeight: 0,
  maxDeviceHeight: 0,
  minWidth: 0,
  maxWidth: 0,
  minDeviceWidth: 0,
  maxDeviceWidth: 0,
  minColor: 0,
  maxColor: 0,
  minColorIndex: 0,
  maxColorIndex: 0,
  minMonochrome: 0,
  maxMonochrome: 0,
  minResolution: 0,
  maxResolution: 0,
  ...featureMatchers,
}

// =======================
// Combine Everything
// =======================

/**
 * Combined object containing all media types and features.
 */
const all = { ...types, ...features }

export default {
  all,
  types,
  matchers,
  features,
}
