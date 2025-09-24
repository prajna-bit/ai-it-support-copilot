# IT Support AI Assistant - Design Guidelines

## Design Decision Framework Analysis
This is a **utility-focused** application for IT support engineers requiring:
- High efficiency and information density
- Professional, distraction-free interface
- Quick access to critical information during incidents
- Reliability over visual flourish

**Selected Approach**: Design System - Material Design 3 (adapted for professional use)

## Core Design Principles
1. **Clarity Over Beauty**: Information accessibility trumps visual appeal
2. **Cognitive Load Reduction**: Minimize mental effort during high-stress incidents
3. **Professional Reliability**: Clean, trustworthy interface that inspires confidence
4. **Rapid Task Completion**: Every interaction optimized for speed

## Color Palette

### Dark Mode (Primary)
- **Primary**: 220 85% 65% (Professional blue for trust and reliability)
- **Surface**: 220 15% 8% (Deep background for reduced eye strain)
- **Surface Variant**: 220 12% 12% (Cards and elevated surfaces)
- **Text Primary**: 0 0% 95% (High contrast for readability)
- **Text Secondary**: 220 10% 70% (Muted for supporting information)
- **Success**: 150 60% 50% (Issue resolved status)
- **Warning**: 35 80% 55% (Pending actions)
- **Error**: 5 70% 55% (Critical incidents)

### Light Mode (Secondary)
- **Primary**: 220 85% 45%
- **Surface**: 0 0% 98%
- **Surface Variant**: 220 15% 95%
- **Text Primary**: 220 15% 15%
- **Text Secondary**: 220 10% 40%

## Typography
- **Primary Font**: Inter (Google Fonts) - Excellent readability for technical content
- **Monospace Font**: JetBrains Mono (Google Fonts) - For code snippets and logs
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px
- **Weights**: 400 (regular), 500 (medium), 600 (semibold)

## Layout System
**Tailwind Spacing Primitives**: 2, 4, 6, 8, 12, 16
- Consistent 8px grid system for predictable spacing
- `p-4` for standard padding, `m-6` for component margins
- `gap-4` for consistent element spacing

## Component Library

### Core Navigation
- **Sidebar Navigation**: Collapsible with clear iconography
- **Top Bar**: Search, notifications, user profile
- **Breadcrumbs**: Essential for deep knowledge base navigation

### Chat Interface
- **Message Bubbles**: Minimal design with clear user/AI distinction
- **Input Area**: Multi-line support with attachment capabilities
- **Suggested Actions**: Contextual quick-reply buttons

### Knowledge Base
- **Document Cards**: Clean cards with metadata and relevance scores
- **Search Results**: List view with highlighting and snippets
- **Document Viewer**: Split-pane with search and navigation

### Data Displays
- **Incident Dashboard**: Status cards with priority indicators
- **Analytics Charts**: Minimal, data-focused visualizations
- **Tables**: Dense information display with sorting and filtering

### Forms & Inputs
- **Search Bars**: Prominent, with autocomplete and filters
- **Feedback Forms**: Simple rating and comment collection
- **File Upload**: Drag-and-drop with progress indicators

### Learning Modules
- **Quiz Interface**: Clean Q&A cards with progress tracking
- **Progress Indicators**: Simple completion bars and badges
- **Knowledge Tree**: Hierarchical topic navigation

## Visual Treatments
- **No Hero Images**: This is a utility application, not a marketing site
- **Minimal Iconography**: Use Heroicons for consistency
- **Subtle Shadows**: `shadow-sm` and `shadow-md` only
- **Rounded Corners**: `rounded-lg` for cards, `rounded-md` for inputs
- **Borders**: Subtle `border-gray-200` dark:`border-gray-700`

## Animations
**Strictly Minimal**: Only essential feedback animations
- Loading states: Simple spinners
- State changes: Subtle opacity transitions (200ms)
- Navigation: Smooth page transitions (300ms)
- **No decorative animations** that could distract from critical tasks

## Key UX Patterns
1. **Context Preservation**: Maintain conversation and search state
2. **Progressive Disclosure**: Show relevant information hierarchically
3. **Keyboard Shortcuts**: Power user efficiency
4. **Offline Indicators**: Clear status of RAG availability
5. **Quick Actions**: One-click access to common tasks

This design prioritizes the IT support engineer's need for rapid, accurate information access during potentially high-stress incident resolution scenarios.