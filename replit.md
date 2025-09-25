# IT Support Assistant - AI-Powered Support Co-pilot

## Overview

This is a comprehensive IT support assistant application that provides AI-powered assistance to support engineers. The system combines modern web technologies with AI capabilities to help support teams efficiently handle incidents, search knowledge bases, and get contextual recommendations. It features both online and offline capabilities, with a demonstration mode for presentations.

The application is built as a full-stack solution with a React frontend using shadcn/ui components and a Node.js/Express backend. It includes a sophisticated RAG (Retrieval-Augmented Generation) system for intelligent document retrieval and AI-powered responses, designed specifically for IT support workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui design system built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom design tokens optimized for professional IT support environments
- **State Management**: TanStack Query for server state management and caching
- **Theme System**: Custom dark/light mode implementation with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js for HTTP server functionality
- **Build System**: Vite for development and ESBuild for production builds
- **Type System**: Full TypeScript implementation across frontend and backend
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **AI Integration**: OpenAI API integration for natural language processing and embeddings

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for scalable cloud deployment
- **Schema**: Comprehensive schema including users, incidents, knowledge base, and vector embeddings
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Sessions**: PostgreSQL-based session storage for user authentication

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Roles**: Role-based access control with support engineer and admin roles
- **Security**: CORS configuration and secure session handling

### External Service Integrations
- **AI Provider**: OpenAI API for GPT-based responses and text embeddings
- **Vector Search**: Cosine similarity search for document retrieval using scikit-learn
- **Development Tools**: Replit integration for cloud development environment

### Key Design Patterns
- **RAG Architecture**: Retrieval-Augmented Generation system combining vector search with AI responses
- **Component-Driven UI**: Modular React components following atomic design principles
- **Type-Safe APIs**: End-to-end TypeScript with shared schema definitions
- **Responsive Design**: Mobile-first approach with dark mode optimization for reduced eye strain
- **Professional Aesthetics**: Material Design 3 adaptation focused on clarity and efficiency over visual flourish

### Offline Capabilities
- **Demo Mode**: Standalone version with pre-computed similarity scores for offline demonstrations
- **Knowledge Base**: Local JSON-based knowledge storage for scenarios without API access
- **Caching Strategy**: Aggressive client-side caching to minimize server dependencies during critical incidents

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for GPT models and text embeddings
- **Deployment**: Replit cloud development and hosting platform

### UI and Design System
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter for body text, JetBrains Mono for code)
- **Styling**: Tailwind CSS with custom configuration for IT support workflows

### Development and Build Tools
- **Package Manager**: npm with package-lock.json for dependency consistency
- **Build Tools**: Vite for development server and ESBuild for production builds
- **Type Checking**: TypeScript compiler for static analysis
- **Database Tools**: Drizzle Kit for schema management and migrations

### Python Dependencies (Legacy/Demo)
- **AI/ML**: OpenAI Python client, scikit-learn for similarity calculations
- **Web Framework**: Flask with CORS support for standalone demo version
- **Data Processing**: NumPy for vector operations, python-dotenv for configuration