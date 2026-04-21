import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // In a real application, you would hash the password here using bcrypt!
    // For this simple mock backend, we store it as is (NOT RECOMMENDED for production)
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name } }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
