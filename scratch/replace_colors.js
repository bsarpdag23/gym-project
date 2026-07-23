const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'gym-frontend', 'src', 'dashboards', 'MemberDashboard.js'),
  path.join(__dirname, '..', 'gym-frontend', 'src', 'dashboards', 'AdminDashboard.js'),
  path.join(__dirname, '..', 'gym-frontend', 'src', 'dashboards', 'SuperAdminDashboard.js')
];

files.forEach(targetFile => {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');

    // Restore dark text colors for high readability on light themes
    content = content.replace(/['"]#9ca3af['"]/g, "'#64748b'");
    content = content.replace(/['"]#cbd5e1['"]/g, "'#475569'");
    content = content.replace(/['"]#d1d5db['"]/g, "'#334155'");

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`✅ Colors restored for light theme in ${path.basename(targetFile)}`);
  }
});
