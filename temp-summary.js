const data = require('./backlog.json');
const projects = {};

data.forEach(s => {
  if (!projects[s.project]) projects[s.project] = { total: 0, byStatus: {} };
  projects[s.project].total++;
  projects[s.project].byStatus[s.status] = (projects[s.project].byStatus[s.status] || 0) + 1;
});

console.log('📊 BubbleUp Backlog Sync Complete!\n');
console.log('Total Stories:', data.length, '\n');

Object.entries(projects).sort((a,b) => b[1].total - a[1].total).forEach(([proj, stats]) => {
  console.log('📁', proj, '(' + stats.total + ' stories)');
  Object.entries(stats.byStatus).sort((a,b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log('   -', status + ':', count);
  });
  console.log('');
});
