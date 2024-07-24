import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Permitir todas as requisições a continuarem para qualquer rota
  return NextResponse.next();
}

// Configurar o middleware para aplicar a todas as rotas
export const config = {
  matcher: '/:path*',
};
