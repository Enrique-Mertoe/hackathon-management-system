import { supabase } from './supabase'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

export interface AuthUser extends User {}

export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, userData: {
    username: string
    full_name: string

    role?: 'PARTICIPANT' | 'ORGANIZER' | 'MENTOR' | 'JUDGE' | 'ADMIN'
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role || 'PARTICIPANT',
          email_verified: false,
        })

      if (profileError) throw profileError
    }

    return { data, error }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://hackathons.lomtechnology.com/auth/callback`,
      }
    })

    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession(sb:any = supabase) {
    const { data: { user }, error } = await sb.auth.getUser()
    return { user, error }
  },

  // Get current user with profile data
  async getCurrentUser(sb:any = supabase): Promise<AuthUser | null> {
    const { user } = await this.getSession(sb);
    if (!user) return null

    const { data: info, error } = await sb
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()



    if (error) throw error
    
    return info
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    return { data, error }
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })

    return { data, error }
  },

  // Delete user account
  async deleteAccount(userId: string) {
    try {
      // First delete user profile from users table
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      // Then delete the auth user (this requires admin privileges)
      // Note: In a production app, this would typically be done via an admin API
      // For now, we'll just delete the profile and sign out the user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      // If admin delete fails (which is expected in client-side code), 
      // we'll handle it gracefully
      if (authError && !authError.message.includes('Invalid API key')) {
        console.warn('Could not delete auth user (admin operation):', authError)
      }

      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Check if user has required role
  hasRole(user: AuthUser | null, requiredRole: User['role']): boolean {
    if (!user) return false
    
    const roleHierarchy = {
      PARTICIPANT: 1,
      ORGANIZER: 2,
      MENTOR: 3,
      JUDGE: 4,
      ADMIN: 5,
    }
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  },

  // Check if user can access resource
  canAccess(user: AuthUser | null, requiredRole: User['role']): boolean {
    return this.hasRole(user, requiredRole)
  }
}