import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { setAccessToken, clearTokens, getAccessToken } from '@/lib/apollo'

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      status
      hasBetaAccess
      subscriptionTier
      subscriptionStatus
      isFoundingMember
      createdAt
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        name
        email
        role
        status
        hasBetaAccess
        subscriptionTier
        subscriptionStatus
        isFoundingMember
      }
    }
  }
`

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  status: string
  hasBetaAccess: boolean
  subscriptionTier: string
  subscriptionStatus: string
  isFoundingMember: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { data, refetch } = useQuery(ME_QUERY, {
    skip: !getAccessToken(),
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        // Only allow ADMIN role to access the admin dashboard
        if (data.me.role === 'ADMIN') {
          setUser(data.me)
        } else {
          clearTokens()
          setUser(null)
        }
      }
      setLoading(false)
    },
    onError: () => {
      clearTokens()
      setUser(null)
      setLoading(false)
    },
  })

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [logoutMutation] = useMutation(LOGOUT_MUTATION)

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (data?.me && data.me.role === 'ADMIN') {
      setUser(data.me)
    }
  }, [data])

  const login = async (email: string, password: string) => {
    const { data } = await loginMutation({
      variables: { email, password },
    })

    if (data?.login) {
      const { accessToken, user } = data.login
      
      // Only allow ADMIN role to login to the admin dashboard
      if (user.role !== 'ADMIN') {
        throw new Error('Access denied. Only application administrators can access this dashboard.')
      }

      setAccessToken(accessToken)
      setUser(user)
    }
  }

  const logout = async () => {
    try {
      await logoutMutation()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        logout,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
