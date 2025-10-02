const data = require('C:/Users/m/OneDrive/Desktop/sales-genie/backlog.json');

const nextStories = data.allStories.filter(s => s.is_next);

console.log('Total NEXT stories:', nextStories.length);
console.log('');
console.log('ID  | Epic            | Priority   | User Story');
console.log('----+----------------+------------+' + '-'.repeat(80));

nextStories.sort((a, b) => a.id.localeCompare(b.id)).forEach(s => {
  const epic = s.epic.padEnd(15);
  const priority = s.priority.padEnd(10);
  const story = s.user_story.substring(0, 100);
  console.log(`${s.id} | ${epic} | ${priority} | ${story}`);
});

console.log('');
console.log('Breakdown by Epic:');
const epicGroups = {};
nextStories.forEach(s => {
  if (!epicGroups[s.epic]) {
    epicGroups[s.epic] = [];
  }
  epicGroups[s.epic].push(s);
});

Object.entries(epicGroups).sort().forEach(([epic, stories]) => {
  console.log(`  ${epic}: ${stories.length} stories`);
});
