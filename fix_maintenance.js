const fs = require('fs');
const path = 'pms-master/tenant_portal_backend/src/maintenance/maintenance.service.ts';
let content = fs.readFileSync(path, 'utf8');

const badBlock1 = `    if (!orgId) {
        throw new BadRequestException('Organization ID is required');
    }
      throw ApiException.forbidden(
        ErrorCode.AUTH_FORBIDDEN,
        'Organization context is required',
      );
    }`;

const goodBlock1 = `    if (!orgId) {
      throw ApiException.forbidden(
        ErrorCode.AUTH_FORBIDDEN,
        'Organization context is required',
      );
    }`;

const badBlock2 = `    if (!orgId) {
        throw new BadRequestException('Organization ID is required');
    }
      throw new BadRequestException('Organization context is required');
    }`;

const goodBlock2 = `    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }`;

let changed = false;
if (content.includes(badBlock1)) {
    content = content.split(badBlock1).join(goodBlock1);
    changed = true;
    console.log('Fixed Type 1 errors');
}

if (content.includes(badBlock2)) {
    content = content.split(badBlock2).join(goodBlock2);
    changed = true;
    console.log('Fixed Type 2 errors');
}

if (changed) {
    fs.writeFileSync(path, content);
} else {
    console.log('No changes made. Patterns not found.');
}
