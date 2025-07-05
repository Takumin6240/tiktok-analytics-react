# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with max warnings = 0
- `npm run type-check` - Run TypeScript type checking without emitting files

### Quality Checks
Always run these commands before committing:
1. `npm run type-check` - Ensure no TypeScript errors
2. `npm run lint` - Ensure no ESLint errors

## Project Architecture

### Core Application Flow
This is a TikTok Live Analytics Dashboard built with React + TypeScript that processes CSV files from TikTok Live Center and generates comprehensive analytics reports.

**Main Data Flow:**
1. **File Upload** (`FileUpload.tsx`) - Handles CSV file uploads with drag & drop
2. **CSV Processing** (`csvParser.ts`) - Parses and validates 4 types of CSV files:
   - Engagement data (likes, comments, shares, gift givers, new followers)
   - Revenue data (diamonds)
   - Activity data (live time, live count)
   - Viewer data (view count, unique viewers, concurrent viewers)
3. **Data Integration** (`App.tsx`) - Combines all data types into unified analytics
4. **Dashboard Display** (`Dashboard.tsx`) - Shows KPIs, charts, and detailed statistics
5. **Export Features** - PDF reports and CSV exports

### Key Components Architecture
- **App.tsx**: Main application state management, file processing orchestration
- **Dashboard.tsx**: Main analytics view with KPIs, charts, and export functionality
- **FileUpload.tsx**: Handles file upload with automatic CSV type detection
- **KPICard.tsx**: Reusable metric display component
- **AnalyticsChart.tsx**: Chart visualization using Recharts
- **DataTable.tsx**: Data table with sorting and filtering
- **DetailedStats.tsx**: Detailed statistics display

### Data Processing Flow
1. **CSV Auto-Detection**: Uses column header matching to determine file type
2. **Data Validation**: Ensures required columns exist and data types are correct
3. **KPI Calculation**: Aggregates metrics across all data types (`analytics.ts`)
4. **Chart Generation**: Creates time-series data for visualization
5. **Insights Generation**: Automatically generates performance insights

### Type System
- **Core Types** (`types/index.ts`):
  - `AnalyticsData`: Container for all 4 data types
  - `EngagementData`, `RevenueData`, `ActivityData`, `ViewerData`: Specific data structures
  - `KPIMetrics`: Calculated metrics and aggregations
  - `FileUploadResult`: File processing result with type detection

### CSV File Format Support
The application expects TikTok Live Center CSV exports with specific column headers:
- **Engagement**: Date, ギフト贈呈者, 新規フォロワー, コメントした視聴者, いいね, シェア
- **Revenue**: Date, ダイヤモンド
- **Activity**: Date, LIVE時間, LIVEの合計数
- **Viewer**: Date, 視聴数, ユニーク視聴者数, 平均視聴時間, 最高同時視聴者数, 平均同時視聴者数

### Export Features
- **PDF Export** (`componentBasedPdfExport.ts`): Component-based PDF generation matching web layout exactly
- **Enhanced PDF** (`enhancedPdfExport.ts`): Legacy PDF export (maintained for compatibility)
- **CSV Export**: Exports processed data in standardized format
- **Excel-style Tables**: Complete data overview in PDF with proper Japanese font support

## Configuration Files

### Build & Development
- **Vite** (`vite.config.ts`): Development server and build configuration
- **TypeScript** (`tsconfig.json`): Strict type checking enabled
- **ESLint** (`eslint.config.js`): React/TypeScript linting with strict rules
- **Tailwind** (`tailwind.config.js`): Custom TikTok brand colors and responsive design

### Deployment
- **Docker** (`Dockerfile`): Multi-stage build with Nginx serving static files
- **Nginx** (`nginx.conf`): Production web server configuration
- **Vercel** (`vercel.json`): Serverless deployment configuration

## Development Guidelines

### Code Style
- Follow existing patterns in component structure and naming
- Use TypeScript strict mode - all types must be properly defined
- Tailwind CSS for styling - use existing custom colors (`tiktok-primary`, `tiktok-secondary`)
- React functional components with hooks

### File Organization
- Components in `src/components/` - single responsibility principle
- Utilities in `src/utils/` - pure functions for data processing
- Types in `src/types/` - comprehensive type definitions
- Assets in `src/assets/` - fonts and static resources

### Testing Strategy
- Manual testing procedures documented in `docs/DEVELOPMENT.md`
- Test with sample CSV files for all 4 data types
- Responsive design testing across mobile/tablet/desktop
- PDF export testing with Japanese font rendering

### Performance Considerations
- CSV processing happens in memory - recommend <1MB files
- Chart rendering optimized for datasets up to 3 months
- PDF generation uses canvas rendering - may be CPU intensive
- Bundle size optimization with dynamic imports where beneficial

## Deployment

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. Use sample CSV files from `docs/` for testing

### Production Build
1. `npm run type-check` - Verify types
2. `npm run lint` - Check code quality
3. `npm run build` - Create production build
4. `npm run preview` - Test production build locally

### Vercel Deployment
- Install Vercel CLI: `npm i -g vercel`
- Deploy: `vercel --prod`
- Auto-deploy from GitHub integration
- See `docs/DEPLOYMENT.md` for detailed deployment guide

## Common Issues

### CSV Upload Issues
- Ensure CSV files use UTF-8 encoding
- Check column headers match expected Japanese names exactly
- File size should be <1MB for optimal performance

### Type Errors
- Run `npm run type-check` to identify issues
- Common issue: Missing type definitions for new data fields
- Update `types/index.ts` when adding new data structures

### Build Errors
- Clear node_modules and reinstall if dependency issues
- Check for unused imports (ESLint will flag them)
- Ensure all dynamic imports have proper error handling

## Claude Code Optimization Instructions

### Assumptions for Claude

- This project is a TikTok Live analytics dashboard built with React + TypeScript.
- CSV file samples for reference are located at:
  `/mnt/c/Users/hirta/program/Tiktok_Analytics_Tools/分析ツール資料/CSV/`
- CSV headers are in Japanese. Claude should **not assume formats**, and instead refer to type definitions in `types/index.ts` or predefined header mappings.

### Instructions to Reduce Token Usage

- Avoid repeating context already described in `CLAUDE.md`.
- Provide diffs only, not full replacements, unless necessary.
- When summarizing code behavior, keep responses short and technical.

### Common Errors to Watch For

- Japanese column headers not matching expected values → validate using sample CSVs
- TypeScript errors due to missing definitions → update `types/index.ts` accordingly
- ESLint errors related to unused variables → fix or disable as needed
