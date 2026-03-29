const TEMPLATES = [
  {
    name: 'Product Roadmap',
    background: 'gradient-blue',
    icon: '🗺️',
    desc: 'Plan and track your product features',
    lists: [
      { title: 'Backlog', cards: ['User research', 'Competitive analysis', 'Feature ideation'] },
      { title: 'To Do', cards: ['Design mockups', 'API planning'] },
      { title: 'Doing', cards: ['Build auth system', 'Dashboard UI'] },
      { title: 'Done', cards: ['Project setup', 'DB schema'] },
    ],
  },
  {
    name: 'Marketing Campaign',
    background: 'gradient-purple',
    icon: '📣',
    desc: 'Manage campaigns from idea to launch',
    lists: [
      { title: 'Ideas', cards: ['Social media blitz', 'Email newsletter', 'Blog post series'] },
      { title: 'Planned', cards: ['Q2 product launch', 'Influencer outreach'] },
      { title: 'In Progress', cards: ['Landing page copy', 'Ad creatives'] },
      { title: 'Published', cards: ['March newsletter', 'Twitter campaign'] },
    ],
  },
  {
    name: 'Sprint Planning',
    background: 'gradient-teal',
    icon: '🏃',
    desc: 'Agile sprint board for your team',
    lists: [
      { title: 'Story Queue', cards: ['User login flow', 'Profile page', 'Notifications'] },
      { title: 'Selected for Sprint', cards: ['Fix payment bug', 'Add dark mode'] },
      { title: 'In Progress', cards: ['Search feature'] },
      { title: 'Review', cards: ['Mobile responsive fixes'] },
      { title: 'Done', cards: ['Setup CI/CD'] },
    ],
  },
  {
    name: 'Personal Tasks',
    background: 'gradient-green',
    icon: '✅',
    desc: 'Stay on top of your personal goals',
    lists: [
      { title: 'Today', cards: ['Morning workout', 'Read 30 mins', 'Reply emails'] },
      { title: 'This Week', cards: ['Grocery shopping', 'Call dentist', 'Review finances'] },
      { title: 'Later', cards: ['Learn Spanish', 'Plan vacation', 'Side project'] },
    ],
  },
  {
    name: 'Bug Tracker',
    background: 'gradient-red',
    icon: '🐛',
    desc: 'Track and resolve bugs efficiently',
    lists: [
      { title: 'Reported', cards: ['Login page crash', 'Image upload fails', 'Slow dashboard'] },
      { title: 'Investigating', cards: ['Memory leak on mobile'] },
      { title: 'Fixing', cards: ['404 on profile page'] },
      { title: 'Verified', cards: ['Cart total wrong'] },
      { title: 'Closed', cards: ['Typo in footer', 'Wrong date format'] },
    ],
  },
];

export default TEMPLATES;
