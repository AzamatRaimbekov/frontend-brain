import { RouteObject } from 'react-router-dom'

export const createRouteObject = <T extends readonly RouteObject[]>(
  routeObject: T,
): T => {
  return routeObject
}
