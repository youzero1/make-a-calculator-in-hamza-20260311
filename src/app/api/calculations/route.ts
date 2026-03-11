import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '../../../lib/database';
import { Calculation } from '../../../entities/Calculation';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    const calculations = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: calculations });
  } catch (error) {
    console.error('GET /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression, result } = body;

    if (!expression || result === undefined || result === null) {
      return NextResponse.json(
        { success: false, error: 'Expression and result are required' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    const calculation = repo.create({
      expression: String(expression),
      result: String(result),
    });

    const saved = await repo.save(calculation);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('POST /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save calculation' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    await repo.clear();
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('DELETE /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear calculations' },
      { status: 500 }
    );
  }
}
