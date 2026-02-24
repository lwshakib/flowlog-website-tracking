# Flowlog

Understand Every Click. Optimize Every Flow.

Flowlog is a modern, real-time website tracking and analytics platform built for developers and product teams. It provides deep insights into user behavior with minimal performance overhead.

## Features

- **Real-time Tracking**: Monitor user interactions as they happen.
- **Flow Visualization**: Understand user paths through intuitive diagrams.
- **Privacy-focused**: Fully GDPR and CCPA compliant.
- **Developer-friendly SDK**: Integrate with just a single line of code.

## System Architecture

```mermaid
graph TD
    subgraph Client Side
        Browser[User Browser]
        SDK[Flowlog SDK]
    end

    subgraph "Flowlog App (Next.js)"
        Ingest[Ingest API (/api/track)]
        Dashboard[Admin Dashboard]
    end

    subgraph External
        Geo[IP-API (Geolocation)]
    end

    subgraph Storage
        DB[(PostgreSQL)]
    end

    Browser --> SDK
    SDK -- Events --> Ingest
    Ingest -- Lookup --> Geo
    Ingest -- Write --> DB
    Dashboard -- Read --> DB
```

## Tech Stack

- **Framework**: Next.js 16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Database**: Prisma with PostgreSQL
- **Authentication**: Better-Auth
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine.
- A PostgreSQL database.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lwshakib/flowlog-website-tracking.git
   cd flowlog-website-tracking
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up your environment variables:
   Copy `.env.example` to `.env` and fill in your database and auth credentials.

4. Run database migrations:

   ```bash
   bun db:migrate
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Code of Conduct

Help us keep Flowlog open and inclusive. Please read and follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Maintainer

**lwshakib** - [GitHub Profile](https://github.com/lwshakib)
