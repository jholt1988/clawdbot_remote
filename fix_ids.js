const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.ts').concat(glob.sync('test/**/*.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix common ID issues
  content = content.replace(/propertyId:\s*1/g, 'propertyId: "1"');
  content = content.replace(/unitId:\s*1/g, 'unitId: "1"');
  content = content.replace(/inspectorId:\s*1/g, 'inspectorId: "1"');
  content = content.replace(/userId:\s*1/g, 'userId: "1"');
  content = content.replace(/createdById:\s*1/g, 'createdById: "1"');
  content = content.replace(/id:\s*1(,|})/g, 'id: "1"$1');
  content = content.replace(/propertyId:\s*'1'/g, 'propertyId: "1"');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
