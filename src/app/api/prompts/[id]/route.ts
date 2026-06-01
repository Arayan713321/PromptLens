import { NextResponse } from "next/server";
import { canUseDatabase, prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUseDatabase())) {
    return NextResponse.json({ error: "DATABASE_URL is not configured or reachable" }, { status: 503 });
  }

  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({
    where: { id },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  return NextResponse.json({ prompt });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUseDatabase())) {
    return NextResponse.json({ error: "DATABASE_URL is not configured or reachable" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  
  const prompt = await prisma.prompt.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      systemPrompt: body.systemPrompt,
      userPrompt: body.userPrompt,
    },
  });

  return NextResponse.json({ prompt });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUseDatabase())) {
    return NextResponse.json({ error: "DATABASE_URL is not configured or reachable" }, { status: 503 });
  }

  const { id } = await params;
  await prisma.prompt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
