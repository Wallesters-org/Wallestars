// Sample data from awesome-selfhosted projects
// This data represents projects that could be fetched from the awesome-selfhosted repository
const selfHostedProjects = [
    {
        id: 1,
        name: "Nextcloud",
        category: "File Sharing",
        description: "A safe home for all your data. Access & share your files, calendars, contacts, mail & more from any device, on your terms.",
        tags: ["PHP", "File Storage", "Calendar", "Contacts"],
        stars: "25.5k",
        url: "https://github.com/nextcloud/server",
        license: "AGPL-3.0"
    },
    {
        id: 2,
        name: "Gitea",
        category: "Development",
        description: "A painless self-hosted Git service. Lightweight, fast, and easy to use. Perfect for small teams and personal projects.",
        tags: ["Go", "Git", "CI/CD", "Issue Tracking"],
        stars: "41.2k",
        url: "https://github.com/go-gitea/gitea",
        license: "MIT"
    },
    {
        id: 3,
        name: "Jellyfin",
        category: "Media Streaming",
        description: "The Free Software Media System. Put your media on your own server and stream it anywhere. No strings attached, no premium unlocks.",
        tags: ["C#", "Media", "Streaming", "Movies"],
        stars: "28.9k",
        url: "https://github.com/jellyfin/jellyfin",
        license: "GPL-2.0"
    },
    {
        id: 4,
        name: "Home Assistant",
        category: "Home Automation",
        description: "Open source home automation that puts local control and privacy first. Powered by a worldwide community of tinkerers and DIY enthusiasts.",
        tags: ["Python", "IoT", "Smart Home", "Automation"],
        stars: "67.8k",
        url: "https://github.com/home-assistant/core",
        license: "Apache-2.0"
    },
    {
        id: 5,
        name: "Monica",
        category: "Personal CRM",
        description: "Personal CRM. Remember everything about your friends, family and business relationships. Never forget a birthday or important date again.",
        tags: ["PHP", "CRM", "Laravel", "Relationships"],
        stars: "20.1k",
        url: "https://github.com/monicahq/monica",
        license: "AGPL-3.0"
    },
    {
        id: 6,
        name: "Bitwarden",
        category: "Password Manager",
        description: "Open source password management solutions. Store and share sensitive data securely with end-to-end encryption.",
        tags: ["C#", "Security", "Password", "Encryption"],
        stars: "13.4k",
        url: "https://github.com/bitwarden/server",
        license: "AGPL-3.0"
    },
    {
        id: 7,
        name: "Bookstack",
        category: "Wiki",
        description: "A simple, self-hosted, easy-to-use platform for organizing and storing information. Perfect for documentation and knowledge base.",
        tags: ["PHP", "Wiki", "Documentation", "Knowledge Base"],
        stars: "13.2k",
        url: "https://github.com/BookStackApp/BookStack",
        license: "MIT"
    },
    {
        id: 8,
        name: "Koel",
        category: "Music Streaming",
        description: "A personal music streaming server that works! Stream your music collection from anywhere with a beautiful interface.",
        tags: ["PHP", "Vue.js", "Music", "Streaming"],
        stars: "15.4k",
        url: "https://github.com/koel/koel",
        license: "MIT"
    },
    {
        id: 9,
        name: "Firefly III",
        category: "Finance",
        description: "A free and open source personal finance manager. Track your expenses, set budgets, and visualize your financial health.",
        tags: ["PHP", "Finance", "Budgeting", "Money Management"],
        stars: "13.8k",
        url: "https://github.com/firefly-iii/firefly-iii",
        license: "AGPL-3.0"
    },
    {
        id: 10,
        name: "Photoprism",
        category: "Photo Management",
        description: "AI-Powered Photos App for the Decentralized Web. Browse, organize, and share your photo collection with ease.",
        tags: ["Go", "Photos", "AI", "Machine Learning"],
        stars: "31.2k",
        url: "https://github.com/photoprism/photoprism",
        license: "AGPL-3.0"
    },
    {
        id: 11,
        name: "Paperless-ngx",
        category: "Document Management",
        description: "A community-supported supercharged version of paperless. Scan, index and archive all your physical documents digitally.",
        tags: ["Python", "OCR", "Documents", "Archival"],
        stars: "15.7k",
        url: "https://github.com/paperless-ngx/paperless-ngx",
        license: "GPL-3.0"
    },
    {
        id: 12,
        name: "Mailcow",
        category: "Email Server",
        description: "Mailcow: dockerized. A fully featured mail server solution that's easy to set up and maintain.",
        tags: ["Docker", "Email", "SMTP", "IMAP"],
        stars: "7.8k",
        url: "https://github.com/mailcow/mailcow-dockerized",
        license: "GPL-3.0"
    },
    {
        id: 13,
        name: "Actual Budget",
        category: "Budgeting",
        description: "A local-first personal finance tool. It is 100% free and open-source, written in NodeJS, with a beautiful interface.",
        tags: ["JavaScript", "Budget", "Finance", "Local-first"],
        stars: "10.5k",
        url: "https://github.com/actualbudget/actual",
        license: "MIT"
    },
    {
        id: 14,
        name: "Vaultwarden",
        category: "Password Manager",
        description: "Unofficial Bitwarden compatible server written in Rust. Lightweight alternative for self-hosting.",
        tags: ["Rust", "Security", "Password", "Lightweight"],
        stars: "32.1k",
        url: "https://github.com/dani-garcia/vaultwarden",
        license: "GPL-3.0"
    },
    {
        id: 15,
        name: "Homebox",
        category: "Inventory Management",
        description: "The Home Inventory and Organization System. Keep track of your household items, warranties, and locations.",
        tags: ["Go", "Vue.js", "Inventory", "Organization"],
        stars: "2.8k",
        url: "https://github.com/hay-kot/homebox",
        license: "AGPL-3.0"
    },
    {
        id: 16,
        name: "Freshrss",
        category: "RSS Reader",
        description: "A free, self-hostable RSS aggregator. Stay up to date with your favorite websites without ads or tracking.",
        tags: ["PHP", "RSS", "News", "Aggregator"],
        stars: "7.9k",
        url: "https://github.com/FreshRSS/FreshRSS",
        license: "AGPL-3.0"
    },
    {
        id: 17,
        name: "Immich",
        category: "Photo Management",
        description: "Self-hosted photo and video backup solution directly from your mobile phone. Like Google Photos, but yours.",
        tags: ["TypeScript", "Photos", "Mobile", "Backup"],
        stars: "35.4k",
        url: "https://github.com/immich-app/immich",
        license: "AGPL-3.0"
    },
    {
        id: 18,
        name: "Mealie",
        category: "Recipe Manager",
        description: "A self-hosted recipe manager and meal planner. Save recipes from around the web and plan your meals.",
        tags: ["Python", "Vue.js", "Recipes", "Meal Planning"],
        stars: "5.1k",
        url: "https://github.com/mealie-recipes/mealie",
        license: "AGPL-3.0"
    },
    {
        id: 19,
        name: "Dashy",
        category: "Dashboard",
        description: "A self-hostable personal dashboard. Organize your self-hosted services with a beautiful, customizable interface.",
        tags: ["Vue.js", "Dashboard", "Homelab", "UI"],
        stars: "15.2k",
        url: "https://github.com/Lissy93/dashy",
        license: "MIT"
    },
    {
        id: 20,
        name: "Uptime Kuma",
        category: "Monitoring",
        description: "A fancy self-hosted monitoring tool. Monitor your websites, services, and get notifications when they're down.",
        tags: ["Node.js", "Monitoring", "Uptime", "Alerts"],
        stars: "48.2k",
        url: "https://github.com/louislam/uptime-kuma",
        license: "MIT"
    }
];
