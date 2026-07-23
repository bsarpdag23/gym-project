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

    // Replace dark grays with high contrast slate/gray colors on dark cards
    content = content.replace(/['"]#6b7280['"]/g, "'#9ca3af'");
    content = content.replace(/['"]#374151['"]/g, "'#cbd5e1'");
    content = content.replace(/['"]#4b5563['"]/g, "'#d1d5db'");

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`✅ Colors updated successfully for ${path.basename(targetFile)}`);
  }
});
