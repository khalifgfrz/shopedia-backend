import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenPayload } from '../token-payload.interface';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    if (user && user.role === 'admin') {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
