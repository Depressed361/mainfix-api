import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<import('express').Request>();
    return req.user as {
      userId: number;
      email: string;
      role: string;
      companyId?: string;
      siteId?: string;
    };
  },
);
