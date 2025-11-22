# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
