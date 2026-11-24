/**
 * ─────────────────────────────────────────────────────────────
 *  ALL PORTFOLIO DATA LIVES HERE.
 *  Edit this file only — the UI rebuilds itself from it.
 * ─────────────────────────────────────────────────────────────
 *
 *  Paths to files in /public are written without a leading slash
 *  (e.g. 'images/taskodoro-1.jpg') so the site works from any base URL.
 *
 *  MEDIA (posts & story slides)
 *  Each item in a post's `media` array is EITHER
 *    - a string path / URL to a real image          → 'images/yard-1.jpg'
 *    - an object that renders a designer placeholder → { title, lines, icon, gradient }
 *  Leave `media` out and one placeholder is generated from the post itself.
 *  Swap placeholders for real images whenever you're ready.
 */

const G = {
  // Gradient presets for placeholders — [from, to]
  sunset: ['#f58529', '#dd2a7b'],
  violet: ['#8134af', '#dd2a7b'],
  ocean: ['#0f2027', '#2c5364'],
  azure: ['#1e3c72', '#2a5298'],
  mint: ['#11998e', '#38ef7d'],
  ember: ['#c31432', '#240b36'],
  gold: ['#f7971e', '#ffd200'],
  steel: ['#232526', '#414345'],
  berry: ['#8e2de2', '#4a00e0'],
  teal: ['#136a8a', '#267871'],
  peach: ['#ee9ca7', '#ffdde1'],
  night: ['#141e30', '#243b55'],
};

// Numbered carousel images in public/images/projects/<dir>/01.jpg, 02.jpg, …
const slides = (dir, count) =>
  Array.from({ length: count }, (_, i) => `images/projects/${dir}/${String(i + 1).padStart(2, '0')}.jpg`);

// Image story slides in public/images/stories/<dir>/01.jpg, …
// links: { slideNumber: { url, label } } adds a link sticker to that slide (1-based).
const storySlides = (dir, count, links = {}, duration) =>
  Array.from({ length: count }, (_, i) => ({
    type: 'image',
    src: `images/stories/${dir}/${String(i + 1).padStart(2, '0')}.jpg`,
    ...(links[i + 1] && { link: links[i + 1] }),
    ...(duration && { duration }),
  }));

export default {
  site: {
    title: 'Abhinand A S (@abhinand.as) • Developer',
    description: 'Software Engineer — Full Stack Developer from Kochi. React, TypeScript, Node.js.',
  },

  profile: {
    username: 'abhinand.as',
    name: 'Abhinand A S',
    verified: true,
    avatar: 'images/me.jpg', // null shows generated initials
    initials: 'AS',
    category: 'Software Engineer · Full Stack Developer',
    bio: [
      '⚛️ React · TypeScript · Node.js',
      '🛠️ Building Taskodoro — a comfort-first planner',
      '📍 Kochi, Kerala, India',
    ],
    link: { url: 'https://github.com/abhi-drops', label: 'github.com/abhi-drops' },
    careerStart: '2024-11', // used to compute "years experience"
    resume: { url: 'resume/Abhinand_AS_Resume.pdf', filename: 'Abhinand_AS_Resume.pdf' },
  },

  // Stats row. Values are computed: years from careerStart, skills from the Skills tab.
  stats: [
    { key: 'years', label: 'years experience', tab: 'experience' },
    { key: 'skills', label: 'skills', tab: 'skills' },
  ],

  // Instagram "Note" bubble above the avatar. Set `text` to add a line above the song,
  // or `song: null` for a text-only note.
  note: {
    text: '',
    // "Chill lofi inspired" by omfgdude — CC0, https://opengameart.org/content/chill-lofi-inspired
    song: { src: 'audio/lofi.mp3', title: 'Chill lofi inspired', artist: 'omfgdude' },
  },

  // Your own story (ring around the avatar). active: false → no ring, nothing opens.
  story: {
    active: false,
    slides: [
      { type: 'text', bg: G.violet, emoji: '👋', title: "Hi, I'm Abhinand", text: 'Full-stack developer from Kochi.' },
      {
        type: 'text', bg: G.mint, emoji: '🗒️', title: 'Now building', text: 'Taskodoro — offline-first planner for web + Android.',
        link: { url: 'https://taskodoro.mavnt.in', label: 'taskodoro.mavnt.in' },
      },
    ],
  },

  // Story highlights under the bio.
  // slide types: 'text' | 'image' | 'video'
  //   text : { type, bg: [from,to], emoji, title, text, link?, duration? }
  //   image: { type, src, caption?, link?, duration? }
  //   video: { type, src, caption?, link? }       (plays for its own length)
  //   link : { url, label } → renders a story link sticker
  highlights: [
    {
      id: 'journey',
      title: 'Journey',
      cover: 'images/stories/covers/journey.jpg',
      slides: storySlides('journey', 8, { 7: { url: 'https://taskodoro.mavnt.in', label: 'taskodoro.mavnt.in' } }, 6500),
    },
    {
      id: 'projects',
      title: 'Projects',
      cover: 'images/stories/covers/projects.jpg',
      slides: storySlides('projects', 6, {
        1: { url: 'https://taskodoro.mavnt.in', label: 'taskodoro.mavnt.in' },
        2: { url: 'https://stepsaway-b892c.web.app', label: 'stepsaway-b892c.web.app' },
        3: { url: 'https://rhythm-three.vercel.app', label: 'rhythm-three.vercel.app' },
        4: { url: 'https://github.com/abhi-drops/flickmate-movie-ticket-booking-site', label: 'View on GitHub' },
        5: { url: 'https://abhi-drops.itch.io/blareland', label: 'Play on itch.io' },
        6: { url: 'https://abhi-drops.itch.io/stepup', label: 'Play on itch.io' },
      }),
    },
    {
      id: 'stack',
      title: 'Stack',
      cover: 'images/stories/covers/stack.jpg',
      slides: storySlides('stack', 5),
    },
    {
      id: 'digitrell',
      title: 'Digitrell',
      cover: 'images/stories/covers/digitrell.jpg',
      slides: storySlides('digitrell', 5, {}, 6000),
    },
    {
      id: 'play',
      title: 'Play',
      cover: 'images/stories/covers/play.jpg',
      slides: storySlides('play', 4, {
        1: { url: 'https://abhi-drops.itch.io/blareland', label: 'Play Blareland' },
        3: { url: 'https://abhi-drops.itch.io/stepup', label: 'Play StepUp' },
      }),
    },
  ],

  // Socials shown in the Message (DM) popup.
  // icon: gmail | linkedin | github | phone | whatsapp | web | instagram | x
  socials: [
    { id: 'gmail', label: 'Gmail', value: 'abhinand4work@gmail.com', href: 'mailto:abhinand4work@gmail.com', icon: 'gmail' },
    { id: 'linkedin', label: 'LinkedIn', value: 'in/abhinand-a-s-', href: 'https://www.linkedin.com/in/abhinand-a-s-', icon: 'linkedin' },
    { id: 'github', label: 'GitHub', value: 'abhi-drops', href: 'https://github.com/abhi-drops', icon: 'github' },
    { id: 'taskodoro', label: 'Taskodoro', value: 'taskodoro.mavnt.in', href: 'https://taskodoro.mavnt.in', icon: 'web' },
  ],

  // DM popup: bubbles that "type in" before the socials.
  dm: {
    status: 'Active now',
    messages: [
      'Hey 👋 I’m Abhinand',
      'Full-stack developer from Kochi — React, TypeScript & Node.js.',
      'Happy to chat about roles, projects or collabs. Find me here 👇',
    ],
    mailSubject: 'Hello from your portfolio',
  },

  // Grid tabs. icon: briefcase | code | cap
  tabs: [
    { id: 'experience', label: 'Experience', icon: 'briefcase' },
    { id: 'skills', label: 'Skills', icon: 'code' },
    { id: 'education', label: 'Education', icon: 'cap' },
  ],

  posts: {
    experience: [
      {
        id: 'fullstack-digitrell',
        title: 'Full-Stack Developer',
        subtitle: 'Digitrell',
        location: 'Digitrell · Kochi',
        date: 'Feb 2025 – Present',
        start: '2025-02',
        end: null,
        tile: { icon: '💼', gradient: G.violet },
        media: slides('fullstack-digitrell', 8),
        caption: 'Developing and maintaining frontend features in React and TypeScript for enterprise logistics and warehouse platforms of a US canned soda & alcoholic beverage manufacturer.',
        tags: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL Server', 'CI/CD', 'Figma'],
        comments: [
          'Built reusable React components across enterprise logistics and warehouse platforms.',
          'Translated UI requirements and wireframes into responsive, accessible interfaces with attention to performance and UX.',
          'Integrated frontend components with REST APIs — async data flows, error states and loading patterns.',
          'Contributed to Node.js backend: API routes, middleware logic and third-party service integrations.',
          'Designed the UI of a user-friendly wrapper around SAP material management, including an Excel-style data entry interface.',
          'Wrote and optimized T-SQL queries on SQL Server to fix production performance issues in data-driven dashboards.',
          'Agile ceremonies, peer reviews and Git branching (feature / staging) with CI/CD delivery.',
        ],
      },
      {
        id: 'ai-docs',
        title: 'AI Document Processing',
        subtitle: 'Feature @ Digitrell',
        location: 'Digitrell · Kochi',
        date: '2025',
        tile: { icon: '🤖', gradient: G.berry },
        media: slides('ai-docs', 5),
        caption: 'Implemented an AI document-processing feature that identifies the correct document from a large set, extracts exactly the required data and stores it as structured records.',
        tags: ['AI', 'Node.js', 'React', 'Structured data'],
        comments: [
          'Identifies the correct document from a large set of documents.',
          'Extracts the exact required fields from it.',
          'Stores the result as structured records for downstream use.',
        ],
      },
      {
        id: 'yard-warehouse',
        title: 'Yard & Warehouse Platforms',
        subtitle: 'US canned beverage manufacturer',
        location: 'Production · Microservices',
        date: '2025 – Present',
        tile: { icon: '🏭', gradient: G.ocean },
        media: slides('yard-warehouse', 6),
        caption: 'Engineered full-stack features for a production yard-management application on a microservices architecture, simplifying everyday warehouse tasks with separate modules for each category of user.',
        tags: ['React', 'TypeScript', 'Node.js', 'Microservices', 'CI/CD', 'REST APIs', 'Azure SQL'],
        comments: [
          'Built 10+ independent modules and features within larger warehouse processes.',
          'Shipped the ZPL label generation module.',
          'Integrated reusable React components with Node.js APIs for real-time data display.',
          'Kept the UI component-based and maintainable, with a strong focus on user experience.',
        ],
      },
      {
        id: 'sap-wrapper',
        title: 'SAP Material Management',
        subtitle: 'UI Wrapper',
        location: 'US canned beverage manufacturer',
        date: '2025',
        tile: { icon: '📦', gradient: G.azure },
        media: slides('sap-wrapper', 5),
        caption: 'Created the screens of a wrapper that gives SAP material management a clean, intuitive interface for everyday users, turning business requirements into simple UI flows.',
        tags: ['React', 'TypeScript', 'TanStack Router', 'Node.js', 'Figma'],
        comments: [
          'Translated business requirements into simple, intuitive UI flows.',
          'Developed an Excel-style field validation manager from Figma specifications.',
          'Focused on accessibility and ease of use — pixel-accurate screens.',
        ],
      },
      {
        id: 'taskodoro',
        title: 'Taskodoro',
        subtitle: 'Comfort Planner · Open source',
        location: 'taskodoro.mavnt.in',
        url: 'https://taskodoro.mavnt.in',
        date: 'Oct 2026 · v0.1 beta',
        tile: { icon: '🗒️', gradient: G.mint },
        media: slides('taskodoro', 9),
        caption: 'What’s the most recreated app in the world? A todo app. So I pushed it to the extreme — quirky features and an aesthetics-first UI built around comfort. Taskodoro is a free, open-source comfort planner for web and Android, now in v0.1 beta.',
        tags: ['React 19', 'TypeScript', 'Hono', 'Cloudflare Workers', 'PostgreSQL', 'Drizzle ORM', 'Docker', 'Capacitor'],
        comments: [
          'Boards for work, home or anything else — columns move tasks forward automatically.',
          'Three kinds of notes: tasks, counters and checklists.',
          'Start from a template — build, export, import, or let an AI assistant write one.',
          'A diary for your board: see what changed day by day, and replay it.',
          'Make it yours: colors, note types and move rules per group.',
          'Sign in with Google to sync across Android and the web; offline-first with on-device SQLite.',
          'Backend on Hono + Cloudflare Workers, PostgreSQL (Neon) via Drizzle ORM, Docker Compose.',
        ],
      },
      {
        id: 'intern-digitrell',
        title: 'Intern',
        subtitle: 'Digitrell',
        location: 'Digitrell · Kochi',
        date: 'Nov 2024 – Feb 2025',
        start: '2024-11',
        end: '2025-02',
        tile: { icon: '🌱', gradient: G.steel },
        media: slides('intern-digitrell', 4),
        caption: 'Started my professional journey at Digitrell — learning the codebase, shipping first React features and growing into a full-stack role.',
        tags: ['React', 'JavaScript', 'Git'],
        comments: [
          'Shipped first production React features under guidance.',
          'Learned Git-based collaborative workflows and agile ceremonies.',
          'Promoted to Full-Stack Developer in Feb 2025.',
        ],
      },
    ],

    // Skills: each `skills` array feeds the "skills" stat count.
    skills: [
      {
        id: 'core', title: 'Core', subtitle: 'The fundamentals', tile: { icon: '🧠', gradient: G.gold },
        media: slides('core', 2),
        skills: ['HTML', 'CSS', 'JavaScript (ES6+)', 'TypeScript'],
        caption: 'Strong fundamentals — async/await, Promises, closures, scope.',
      },
      {
        id: 'frontend', title: 'Frontend', subtitle: 'React & friends', tile: { icon: '⚛️', gradient: G.berry },
        media: slides('frontend', 2),
        skills: ['React', 'Next.js', 'TanStack Router', 'Tailwind CSS', 'Responsive Design', 'Accessibility'],
        caption: 'React (hooks, component lifecycle), Next.js (routing, SSR basics) and responsive, accessible UI.',
      },
      {
        id: 'backend', title: 'Backend & DB', subtitle: 'APIs and data', tile: { icon: '🗄️', gradient: G.teal },
        media: slides('backend', 3),
        skills: ['Node.js', 'Express.js', 'Hono', 'REST APIs', 'JWT', 'Sequelize', 'TypeORM', 'Drizzle ORM', 'SQL Server (T-SQL)', 'MySQL', 'PostgreSQL', 'MongoDB'],
        caption: 'Node.js services, ORMs and relational + document databases, with solid error handling.',
      },
      {
        id: 'design', title: 'Design & UI', subtitle: 'Figma to pixels', tile: { icon: '🎨', gradient: G.peach },
        media: slides('design', 2),
        skills: ['Figma', 'Wireframe Implementation', 'UI/UX Thinking'],
        caption: 'Turning designs and wireframes into pixel-accurate interfaces.',
      },
      {
        id: 'tools', title: 'Tools & Workflow', subtitle: 'Daily drivers', tile: { icon: '🛠️', gradient: G.steel },
        media: slides('tools', 3),
        skills: ['Git', 'GitHub', 'CI/CD', 'Docker', 'VS Code', 'DBeaver', 'Bruno', 'Postman'],
        caption: 'Git-based collaborative development and CI/CD pipelines.',
      },
      {
        id: 'ai', title: 'AI-Assisted Coding', subtitle: 'Pair programming 2.0', tile: { icon: '🤖', gradient: G.violet },
        media: slides('ai', 2),
        skills: ['Claude Code', 'Cursor', 'GitHub Copilot'],
        caption: 'Using AI coding tools to move faster without losing quality.',
      },
      {
        id: 'cloud', title: 'Cloud & Mobile', subtitle: 'Deploy anywhere', tile: { icon: '☁️', gradient: G.sunset },
        media: slides('cloud', 2),
        skills: ['Cloudflare Workers', 'Azure SQL', 'Azure Blob Storage', 'Azure Logic Apps', 'Capacitor.js', 'PWA'],
        caption: 'Cloudflare Workers, Azure (SQL Server, Blob Storage, basic Logic Apps), Capacitor and PWAs.',
      },
    ],

    // Newest first. College projects sit next to the course they were built for.
    education: [
      {
        id: 'stepsaway',
        title: 'Steps Away',
        subtitle: 'MERN final project · Luminar',
        location: 'stepsaway-b892c.web.app',
        url: 'https://stepsaway-b892c.web.app',
        date: 'Nov 2024',
        tile: { icon: '🌍', gradient: G.teal },
        media: slides('stepsaway', 8),
        caption: 'My final project for the MERN stack course at Luminar Technolab — a text-based, location-specific community platform that connects people within their city. Each city is a hub, with circles for shared interests and a lineup of local events.',
        tags: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'Axios', 'DiceBear', 'React Toastify', 'GeoNames API'],
        comments: [
          'Add any city that isn’t listed yet with the GeoNames API.',
          'Join or create circles, post notes, and like or comment on them.',
          'Profiles with a bio, Instagram/Facebook links and DiceBear-generated avatars.',
          'Report profiles, notes or events; admins ban users, remove content and resolve reports.',
          'Share links to profiles and notes on other social platforms.',
          'Fully responsive with basic PWA support.',
          'Code: github.com/abhi-drops/stepsAway_Frontend · github.com/abhi-drops/StepsAway_server',
        ],
      },
      {
        id: 'mern-cert',
        title: 'MERN Full Stack',
        subtitle: 'Luminar Technolab · NCTT',
        location: 'Luminar Technolab, Kochi',
        date: '2024 · 7 months',
        tile: { icon: '📜', gradient: G.berry },
        media: slides('mern-cert', 3),
        caption: 'MERN Full Stack training (7 months) at Luminar Technolab, 2024. Certificate from the National Council for Technology and Training (NCTT).',
        tags: ['MongoDB', 'Express', 'React', 'Node.js'],
        comments: [
          'Hands-on MongoDB, Express, React and Node.js projects.',
          'Certified by the National Council for Technology and Training (NCTT).',
        ],
      },
      {
        id: 'rhythm',
        title: 'Rhythm',
        subtitle: 'BCA main project · CMS College',
        location: 'rhythm-three.vercel.app',
        url: 'https://rhythm-three.vercel.app',
        date: 'Jun 2024',
        tile: { icon: '🎵', gradient: G.berry },
        media: slides('rhythm', 7),
        caption: 'My main project for the BCA degree at CMS College — a music sharing platform where you upload and share your tracks, explore what others play, and support the creators you love.',
        tags: ['SvelteKit', 'Firebase', 'Cloud Firestore', 'Tailwind CSS', 'Flowbite Svelte'],
        comments: [
          'Upload and share your favourite music; explore and play tracks from other users.',
          'Like songs, create playlists, and search songs, playlists and users.',
          'Follow and tip fellow music creators.',
          'Seamless light and dark mode, plus a forgot-password flow.',
          'Code: github.com/abhi-drops/Rhythm-music-sharing-platform',
        ],
      },
      {
        id: 'flickmate',
        title: 'FlickMate',
        subtitle: 'BCA mini project · CMS College',
        location: 'github.com/abhi-drops',
        url: 'https://github.com/abhi-drops/flickmate-movie-ticket-booking-site',
        date: 'Jun 2024',
        tile: { icon: '🎬', gradient: G.ember },
        media: slides('flickmate', 7),
        caption: 'My BCA mini project at CMS College — a movie ticket booking website for a single theatre, with a rewards system called Flickcoins.',
        tags: ['PHP', 'MySQLi', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
        comments: [
          'Seamless ticket booking with simple email sign-up.',
          'Flickcoins: 50 free coins for new users and 5% back on every purchase, applied automatically next time.',
          'Seat selection across platinum, gold and silver tiers.',
          'Admin panel to manage movies, bookings and data for specific dates, with revenue tracking.',
        ],
      },
      {
        id: 'bca',
        title: 'Bachelor of Computer Applications',
        subtitle: 'CMS College Kottayam',
        location: 'Kottayam, Kerala',
        date: '2021 – 2024',
        tile: { icon: '🎓', gradient: G.azure },
        media: slides('bca', 3),
        caption: 'Bachelor of Computer Applications (BCA) at CMS College Kottayam, Kerala — 2021 to 2024, CGPA 6.24.',
        tags: ['BCA', 'Computer Applications'],
        comments: [
          'Programming, data structures, databases and web development foundations.',
          'Graduated 2024 with CGPA 6.24.',
        ],
      },
      {
        id: 'blareland',
        title: 'Blareland',
        subtitle: 'Unity 2D game · BCA summer',
        location: 'abhi-drops.itch.io',
        url: 'https://abhi-drops.itch.io/blareland',
        date: 'BCA summer project',
        tile: { icon: '👾', gradient: G.violet },
        media: slides('blareland', 5),
        caption: 'A small 2D mini shooter I made in Unity (C#) during a summer vacation at CMS College Kottayam — built completely from scratch, including the graphics and music. Playable in the browser and on Windows.',
        tags: ['Unity', 'C#', 'Game Development', '2D Game'],
        comments: [
          'Objective: kill all enemies before they touch the ground.',
          'Enemies drop bombs and spawn faster as the game progresses.',
          'Boss battle: a big enemy that takes five hits to defeat.',
          'Power-ups that clear every enemy on screen.',
          'Buy new themes and upgrade movement speed with collected coins.',
          'Global scoreboard to compete with players worldwide.',
          'Code: github.com/abhi-drops/BLARELAND---2D-game-using-Unity-C-',
        ],
      },
      {
        id: 'stepup',
        title: 'StepUp',
        subtitle: 'My first game · GDevelop',
        location: 'abhi-drops.itch.io',
        url: 'https://abhi-drops.itch.io/stepup',
        date: '2021',
        tile: { icon: '🕹️', gradient: G.ember },
        media: slides('stepup', 4),
        caption: 'Where it all began — my first ever game, a tiny arcade jumper built with GDevelop. Tap (or press space) to jump from floor to floor and chase the high score.',
        tags: ['GDevelop', 'HTML5', 'Android', 'Arcade'],
        comments: [
          'Built with GDevelop, with graphics and music made by me.',
          'Released for the web (HTML5), Windows, macOS and Android.',
          'Includes a quick tutorial, score and high-score tracking.',
        ],
      },
    ],
  },
};
