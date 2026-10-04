---
version: alpha
name: Antarctic Field Notebook
description: A cool grey paper operations notebook for inspecting India's Antarctic stations.
colors:
  primary: '#345D6B'
  background: '#D9DEDA'
  surface: '#E4E8E5'
  inset: '#D4DBD7'
  text: '#192629'
  muted: '#435558'
  border: '#9BA9A4'
  signal: '#A34F29'
  success: '#235B42'
  danger: '#B23F3E'
typography:
  sans:
    fontFamily: 'Avenir Next, Segoe UI, system-ui, sans-serif'
  mono:
    fontFamily: 'SFMono-Regular, Consolas, monospace'
rounded:
  DEFAULT: '3px'
  sm: '3px'
  md: '3px'
  lg: '3px'
spacing:
  section-gap: '24px'
  page-max: '1680px'
components:
  button: {}
  card: {}
  dialog: {}
  navigation: {}
  scene: {}
---

# Antarctic Field Notebook Design System

## Overview

### Creative North Star

A polar expedition engineering notebook: cool recycled grey paper, graphite ink, ruled divisions, stamped section numbers and restrained blue navigation. The 3D world supplies spatial richness; control surfaces stay quiet.

### Product context and register

Audience: researchers and prototype operators exploring Maitri and Bharati, inspecting simulated station telemetry, and exercising incident response. Repository README and API are the behavioral evidence. This is a local digital twin prototype, not an official operational NCPOR console.

English labels and SI units follow the existing project. No additional locale is introduced. Desktop inspection is primary, with all actions retained on narrow screens. Register: utility product UI. Signature: engineering section numbers, paper grain and sparse orange marks. Familiar controls, legible data and recoverable navigation take priority.

Token ownership is **Model B**: `frontend/src/index.css` is the canonical runtime source, mirrored above. Component CSS consumes semantic variables. Light mode uses cool grey paper; dark mode uses charcoal paper. No cream surfaces. The utility adapter keeps existing panels and overlays on the same palette.

## Colors

Primary blue identifies selection and focus. Signal orange marks numbered routes. Nominal status uses graphite text with a small muted green dot, without green backgrounds or borders. Green readings use the semantic success token with sufficient contrast; red indicates active incidents. Color is accompanied by text. Paper grain is subtle, stationary, and does not reduce text contrast. Dark mode maps the same roles through the root semantic variables.

## Typography

Avenir Next and system fallbacks provide headings and prose. SFMono-Regular and Consolas provide technical readings with tabular numerals. Titles are 34–64px depending on the route and viewport; body 13–14px, control labels 12px, short technical captions 10–11px. Uppercase is restricted to short section labels.

## Layout

Dashboard max width 1680px, twin 1800px. Page gutters 14–52px. Main sections use 24–30px gaps. Dashboard uses a compact header and a 206px station workspace rail. The overview has four essential resource readings and a system watch beside outside conditions. Dedicated Infrastructure, Energy, Logistics, Environment, Analysis and Exercises views prevent competing dense panels. The rail becomes horizontal navigation below 760px; resource readings wrap into two columns below 1200px. Scene tools are outside the canvas, and camera waypoints follow the scene in document flow. Telemetry is beside the canvas above 1100px and below it on narrower screens. Natural page scrolling preserves the scene area.

## Elevation & Depth

Paper panels use borders and tonal changes, with small offset shadows only on primary actions and the scene frame. Routine data panels do not glow. Dialog backdrops retain depth and focus isolation. The 3D renderer owns world lighting, shadows and physical materials independently from UI theme.

## Shapes

Rectangular three-pixel corners match printed field sheets. Status dots and the radio brand stamp remain circular. Lucide outline icons use consistent 16px control sizing.

## Components

### Foundational visual states

Selected controls have a blue border and underline; hover changes the surface tone. Focus-visible uses a two-pixel blue outline. Disabled actions preserve geometry with reduced opacity. Existing busy labels and incident feedback are retained. Connection state distinguishes live stream, fallback and offline states; values retain existing simulator defaults while connecting.

### Buttons and actions

Walking and entering the station use the primary blue action. Restoring nominal state is green and separate from scenario triggers. Icon-only controls have accessible labels. Controls have at least 36–38px height. Tabs and small technical choices may wrap on narrow screens.

### Navigation and data display

Header station switching, dashboard/twin navigation and clock mode are preserved. Overview readings and system rows lead to dedicated domain views or sensor diagnostics. Sensor ranges and equipment metadata are labeled prototype configuration. ML modes, chart signal selection, alerts and telemetry retain their handlers. Missing values display an em dash; experimental anomaly scores are not described as failure probabilities. Camera cards form a horizontally scrollable route; selecting a card does not scroll the entire page. Tour pauses when exploration begins.

### Forms and overlays

Existing sensor detail modal and alerts drawer remain the canonical owners. The twin telemetry panel is nonmodal and never covers the scene. First-person entry explains movement before pointer capture; Escape returns to orbit. Model references disclose interpreted room positions and compressed site infrastructure.

### Iconography

Lucide outlines at 16px, with text for principal actions. Icons carry meaning without becoming decorative tiles.

### Motion

Camera flights can be interrupted with orbit interaction. Snow and directional route flow represent environment and processes. Status pulses and CSS transitions obey reduced motion. Pointer movement and gravity continue to respond directly to input.

### Content and data visualization

Use concrete equipment and process labels. Readings show units, station identity and status. Incident exercises are labelled as exercises. The chart retains all power, fuel and thermal series. Source-grounded architecture is separated from interpreted circulation.

## Do's and Don'ts

- Do retain all operations and feedback when adapting layout.
- Do keep navigation outside the interactive canvas.
- Don't compress the complete workflow into an unscrollable viewport.
- Don't use cream, neon surface glows or oversized decorative gradients.

## Scene interaction refinement — 4 October 2026

The full viewport scene removes the identity banner and camera dock, retaining compact display, workflow, telemetry and exit controls. Native fullscreen is requested where supported; the same layout fills the app viewport in embedded browsers. System labels use a fixed 200 × 50 CSS-pixel projection, collision spacing and leader lines, and render above transparent terrain/water. Equipment materials and affected service routes pulse at one cycle per second during exercises; reduced motion uses a steady alert tint. Rocks and snow placements reserve building footprints and service corridors with five metres of clearance. Spectate replaces walking: free flight follows the camera direction, ignores collisions and gravity, and supports vertical motion and speed boost. Dashboard exercises use compact rows.

### Workflow callout correction

Scene callouts are compact 142 × 48 pixel bordered cards with small target dots and elbow leader lines. Their placement avoids the projected main-station footprint and other callouts. The active workflow owns its stage labels; All routes limits labels to sources/destinations. Off hides workflow labels and retains hover diagnostics and one active-incident callout. Physical incident feedback remains visible independently of workflow labels. Oversized generic subsystem cards and duplicate route signs are removed.

### Twin label and readability refinement

Twin text uses an 8% increase for controls, telemetry, clocks and waypoint cards. Floating callouts use fixed 176 × 60 pixel ice-white cards, dark 13px titles, workflow category colors and matching thin elbow leaders with white-ringed target dots. The layout rejects positions intersecting the projected station and entrance bounds, other cards or target clearances. At close zoom or small viewports, cards without a valid position are hidden while target dots remain visible. Dashboard typography keeps its independent 10% scale.
