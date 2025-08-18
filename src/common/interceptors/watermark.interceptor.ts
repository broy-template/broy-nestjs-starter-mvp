/**
 * Copyright (c) 2025 Roy Aziz Barera
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @author Roy Aziz Barera <@royazizbarera>
 * @github forscy
 * @version 1.0.0
 * @license Proprietary
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WatermarkInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    // Add watermark headers to every response
    response.setHeader('X-Powered-By', 'Roy Aziz Barera - NestJS Starter MVP');
    response.setHeader('X-Author', 'Roy Aziz Barera');
    response.setHeader('X-Contact', '@royazizbarera');
    response.setHeader('X-Github', 'github.com/forscy');
    response.setHeader('X-License', 'Proprietary');
    response.setHeader('X-Copyright', '© 2025 Roy Aziz Barera');
    response.setHeader('X-Build-Date', new Date().toISOString());
    
    return next.handle().pipe(
      map((data) => {
        // Add watermark to response body for JSON responses
        if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
          return {
            ...data,
            _watermark: {
              author: 'Roy Aziz Barera',
              contact: '@royazizbarera',
              github: 'github.com/forscy',
              license: 'Proprietary',
              copyright: '© 2025 Roy Aziz Barera',
              buildDate: new Date().toISOString()
            }
          };
        }
        return data;
      })
    );
  }
}
