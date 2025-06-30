import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, full_name, role } = await request.json()

    if (!email || !password || !username || !full_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const { data, error } = await auth.signUp(email, password, {
      username,
      full_name,
      role: role || 'PARTICIPANT'
    })

    if (error) {
      return NextResponse.json(
          //@ts-ignore
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: data.user
    })

  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}