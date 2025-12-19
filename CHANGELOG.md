# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-12-19

### Added

- **Docker Support**: Full Docker deployment with RustFS and Standalone modes
- **Screensaver Feature**:
  - Animated grid screensaver with photo flip transitions
  - Settings modal with fullscreen toggle and auto-hide controls
  - Photo data prefetching for smooth transitions
- **Individual Photograph Pages**:
  - Dedicated photo detail view with metadata generation
  - Blurred background image effect
  - Loading skeleton state
- **Cloudflare Image Loader**: Optimized image delivery via Cloudflare
- **Enhanced Mapbox**:
  - Multi-marker support with drag-and-drop positioning
  - Map auto-centering when selecting photos in discover view
  - Limited zoom level to 10 for better UX
- **Photo Sorting**: Sort photos by date with newest/oldest first options
- **PostgreSQL Support**: Added PostgreSQL dependencies for database flexibility

### Changed

- **Next.js**: Upgraded from 16.0.0 → 16.0.7 → 16.0.10
- **UI Improvements**:
  - Increased city sets display limit from 9 to 12
  - Improved photo preview card responsive layout and styling
  - Better screensaver grid with fixed row count and dynamic sizing
- **Code Organization**:
  - Renamed and reorganized S3 utility functions and client files
  - Renamed blog components and removed PostPreview wrapper
  - Standardized zod imports and use native validators
  - Standardized onMarkerDragEnd callback signature

### Fixed

- Fixed sidebar skeleton width calculation
- Addressed YouTube extension typing issues
- Updated image placeholder extension
- Added cache invalidation for city sets

### Removed

- Removed unused limit parameter from getCitySets procedure
- Removed user-card component from auth module
- Removed debugging console logs

### Documentation

- Added screenshots section to README with home page and dashboard images
- Added warning about custom image loader configuration for non-Cloudflare R2 users

### Technical Details

- 31 commits since v2.1.0
- 75 files changed
- +1,721 insertions, -1,722 deletions

## [2.1.0] - 2025-11-22

### Added

- **Mapbox Integration**: Interactive map embeds with location toolbar functionality
  - Interactive map preview with zoom controls in MapboxToolbar dialog
  - Drag rotate and drag pan controls for enhanced map interaction
  - Location-based content embedding support
- **Editor Toolbar Enhancements**:
  - Dedicated Heading toolbar component for better text formatting
  - Separate Color and Highlight toolbar components for improved UX
  - Numeric font size display replacing generic Type icon

### Changed

- **Editor Performance**: Optimized editor toolbar performance using `useEditorState` hook
- **Code Organization**:
  - Extracted Tiptap editor styles to dedicated CSS file for better maintainability
  - Normalized YouTube extension indentation from 4 spaces to 2 spaces
- **Image Responsiveness**: Improved image component responsiveness and simplified RichTextViewer

### Fixed

- Added explicit `type="button"` attribute to prevent unintended form submissions in editor components

### Technical Details

- 28 files changed
- +1,846 insertions, -750 deletions

## [2.0.0] - Previous Release

- Initial stable release
