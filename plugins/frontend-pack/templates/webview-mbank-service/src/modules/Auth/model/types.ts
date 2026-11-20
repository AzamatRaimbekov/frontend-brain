export interface LoginReq {
  token: string
  is_custom?: boolean
}
export interface AuthState {
  userData: UserData | null
}
export interface UserData {
  authenticated: boolean
  user_id: number
  inn: string
  full_name: string
  phone_number: string
  birth_date: string
}
