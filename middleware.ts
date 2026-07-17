import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.headers.has("next-action")) {
    return new NextResponse("Server Actions are not enabled for this application.", {
      status: 400
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"]
};
