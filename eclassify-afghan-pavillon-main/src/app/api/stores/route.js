import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/stores - Get all stores
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';
    const verified = searchParams.get('verified');
    const sort = searchParams.get('sort') || '-createdAt';
    
    const query = { status };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (verified === 'true') {
      query['verification.isVerified'] = true;
    }
    
    const skip = (page - 1) * limit;
    
    const [stores, total] = await Promise.all([
      Store.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .lean(),
      Store.countDocuments(query)
    ]);
    
    return NextResponse.json({
      stores,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST /api/stores - Create a new store
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: session.user.id });
    if (existingStore) {
      return NextResponse.json(
        { error: 'You already have a store' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'contact.email'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Set owner to current user
    data.owner = session.user.id;
    
    const store = await Store.create(data);
    
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
} 