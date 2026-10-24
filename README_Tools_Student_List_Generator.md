# Antigravity Implementation Prompt — Student Tools & Printable PDF Generator

## Goal

Improve the existing University College of Rathmalana (UCR), Division of Television Studies student portal by adding a polished **Tools** page and a working **Student List Generator**. This is an enhancement to the existing project, not a request to rebuild the whole website.

**First inspect the current repository and existing README, framework, routes, components, styling, student data source, and authentication. Preserve the existing working functionality and visual identity.** Do not replace the project with a new stack unless the current stack cannot support the feature.

Use the supplied UI reference screenshot as the design target. Match the existing portal's dark navy interface, orange and blue course accents, UCR/UoVT branding, rounded cards, subtle borders, and restrained animations.

## Existing Portal Context

- Institution: University College of Rathmalana (UCR)
- Division: Division of Television Studies
- Powered by: University of Vocational Technology (UoVT)
- Main courses:
  - **TPOPT** — Television and Digital Media Post Production Technology
  - **TPRPT** — Television and Digital Media Production Technology
- Existing main navigation currently includes Home, Students, Modules, Events, and Contact. Add **Tools** as a new navigation item, styled consistently with the other links. Do not remove or rename existing routes.
- The current portal already has student records and a student directory. Reuse the existing student data source and admin-managed records. Do not create a separate hard-coded student list for the Tools page.
- Use the existing official logos and paths. If available, these may be `public/images/ucr.png` and `public/images/uovt.png`; inspect the repository to confirm before using paths.

## Design Requirements

Create a premium, professional, responsive page at the route `/tools` (follow the existing routing conventions if different).

### Visual design
- Deep navy / near-black background consistent with the current portal.
- Orange accent for TPOPT and primary actions.
- Bright blue accent for TPRPT.
- White primary text and muted blue-grey secondary text.
- Subtle gradients and camera/media-production imagery in the hero, with a dark overlay for text readability.
- Use the current project's fonts, icon library, spacing system, and components where possible.
- Reuse the existing header and footer rather than duplicating them.
- Avoid excessive glow, clutter, or heavy animations.
- Use clear focus states, adequate contrast, readable labels, and touch-friendly controls.
- Use short, smooth transitions and respect `prefers-reduced-motion`.

### Responsive layout
- Desktop: two-column workspace. Student selection and document options on the left; live document preview on the right.
- Tablet: reduce column widths and stack panels when needed.
- Mobile: a single-column layout with collapsible sections for student selection, document options, and preview. Keep the primary Generate PDF action easy to reach.
- No horizontal page overflow at widths 320px, 375px, 390px, 430px, 768px, 1024px, and 1440px.
- Tables must either fit responsively or use a deliberate horizontal-scroll container.
- Controls should be large enough for touch interaction.

## Page Structure

### 1. Header and hero
- Add **Tools** to the existing navbar and show an active state on `/tools`.
- Hero eyebrow: `TOOLS`
- Heading: `Student List Generator`
- Description: `Generate and download student lists for official use. Select a course, choose students, customise the document, and export a clean printable PDF.`
- Use a suitable media-production image already in the project if one exists. If not, use a local/generated or royalty-free camera/studio image with a dark overlay. Avoid broken image URLs.
- Keep the hero compact enough that users can reach the tool without excessive scrolling.

### 2. Student selection panel

Provide course selection options:

1. **All Students**
2. **TPOPT Only**
3. **TPRPT Only**
4. **Selected Students (Custom)**

Display live counts based on the actual student records. Never assume that counts in an old screenshot are current.

Include:
- Search by student name or student ID/index number.
- Course filter.
- Optional semester/batch filter only if those fields exist in the current data model.
- Optional status filter only if student status exists in the current data model.
- Select individual students using checkboxes.
- Select all currently filtered students.
- Clear selection.
- Show selected count.
- Display student name, ID/index number if available, course badge, and other useful fields already stored in the existing data model.
- Use orange course styling for TPOPT and blue styling for TPRPT.
- Selection state must persist while the user changes search/filter controls unless they explicitly clear or deselect students.
- In “Selected Students (Custom)” mode, generate the document from the explicitly selected students. If none are selected, show a clear validation message and do not generate a blank list unintentionally.
- In All Students/TPOPT/TPRPT modes, derive the document list from the selected mode and active filters according to a clearly documented rule. Avoid surprising behaviour. A good approach is: the chosen mode defines the base set, while search is only for finding/toggling records; include active filter controls in the generated set only if the UI clearly communicates that they affect output.
- Keep selection and output counts synchronised.

### 3. Document options

Create a clean options panel with these settings.

#### Document format
Use a radio group or segmented controls for:
- **Simple List** — `No. | Name | Tel. No | Empty Column`
- **With Student ID** — `No. | Student ID | Name | Tel. No | Empty Column`
- **With Course & Semester** — `No. | Name | Course | Semester | Tel. No | Empty Column`
- **Custom Format** — let the user choose which supported columns to include and reorder them if practical.

For Simple List, the columns must be:
- `No.`
- `Name`
- `Tel. No`
- One empty column with no heading or a configurable blank heading

The empty column is intentional so a printed sheet can be filled in by hand. It must have visible borders and sufficient width for handwriting. Do not remove it when exporting.

#### Header options
Default document heading should be centred at the top of the printed page, with these lines:

**Sample headline 1**  
**Division of Television Studies**  
**University College of Rathmalana**

- “Sample headline 1” is editable by the user and should be a placeholder/sample title, not a hard-coded official title.
- The Division and University College lines should be centred.
- Add an optional setting to show/hide the supplied UCR and UoVT logos in the document header.
- Provide an optional date line or generated date setting.
- Provide an optional subtitle.
- Keep typography formal and print-friendly.
- If the user changes the heading text or options, update the preview immediately.

#### Additional options
- Include serial number (on by default).
- Include telephone number (on by default).
- Sort by name A–Z (on by default); provide an option to keep the existing student order.
- Include student ID (optional; default off for Simple List).
- Include course and semester (optional; only where data exists).
- Include date (optional).
- Repeat table header on each PDF page.
- Set paper size: A4 (default), optionally Letter.
- Orientation: Portrait (default) or Landscape.
- Set number of blank rows to append for handwriting (configurable, e.g. 0–15).
- Set rows per page only if needed; otherwise paginate automatically.
- Allow users to customise the empty column's heading (default blank) and width where feasible.

Do not show fields such as telephone number or student ID if the existing data model does not contain them. If telephone numbers are missing, render an empty cell rather than inventing one.

### 4. Live document preview

The preview is a central feature, not just a decorative image. It must display a real preview of the document that will be exported.

- Render a white paper sheet on a light neutral background inside the dark preview panel.
- Centre the heading lines at the top.
- If enabled and available, show the supplied institutional logos.
- Render the exact table columns, order, row sequence, borders, and blank handwriting column.
- Use actual selected student records and their available data.
- Update instantly when the user changes the course mode, student selection, sorting, header, columns, paper size, orientation, or blank-row count.
- Display preview page navigation and page count when the document has multiple pages.
- Show a zoom control if practical, but do not let it interfere with mobile use.
- The preview must reflect the actual print/PDF output as closely as possible.
- On mobile, place the preview after the selection/options panels and allow the preview section to collapse.
- If there are no eligible students, show a friendly empty state instead of a broken/empty table.

### 5. PDF generation and printing

Provide two working actions:
- **Generate PDF**
- **Preview / Print**

Use a reliable PDF-generation approach compatible with the current stack. Prefer a library already installed in the repository; otherwise choose a maintained browser-compatible PDF solution such as `jsPDF` with `jspdf-autotable`, or a print stylesheet with the browser's print-to-PDF workflow. Choose one appropriate implementation and document it.

Requirements:
- Download a real PDF file; do not merely rename an HTML file to `.pdf`.
- The PDF must use the current output student set, column settings, header settings, and logo options.
- Use a formal printable layout with black text, white background, clear borders, and readable font sizes.
- Use proper page margins and automatic pagination.
- Repeat table headings on each page where supported.
- Keep rows together where practical.
- Preserve the empty handwriting column on every page.
- Add page numbers if feasible.
- Ensure long student names wrap cleanly and table rows do not overlap.
- Ensure blank rows are included in the output and have enough height for handwriting.
- Use local logo assets or embedded images when generating the PDF, and handle missing logos gracefully.
- Show loading state while generating, then a clear success/error message.
- Disable generation when the selection is invalid or there are no students.
- Do not silently swallow errors.
- Use meaningful filenames, for example `TPOPT_student_list_2026-10-24.pdf`, `TPRPT_student_list_2026-10-24.pdf`, or `television_studies_student_list_2026-10-24.pdf`, using the current date and selection mode.
- Never claim the PDF was created if generation failed.

### 6. Tools page state and usability

- Maintain a single source of truth for the selected student IDs, current course mode, format, column choices, header fields, and preview page.
- Avoid state bugs when filters change.
- Use existing reusable UI components.
- Show clear validation when custom selection is empty.
- Keep keyboard navigation and focus states usable.
- Use accessible labels for search, checkboxes, radio buttons, and settings.
- Add loading, empty, success, and error states.
- Confirm only when a destructive action warrants it; clearing a selection should be easy to undo by selecting students again.
- Do not add decorative controls that do nothing.

## Data and Privacy

- Reuse the portal's actual student database/API/data-access layer.
- Do not hard-code the sample names or telephone numbers from the reference screenshot into production.
- Do not create a duplicate or separate student database for Tools.
- Use only the fields that exist in the actual schema.
- If phone numbers are missing from records, show blank cells and document that phone fields must be added to the admin/student schema if required.
- Do not expose private student fields in public pages or public API responses. If this tool is intended for authorised staff/admin use, protect `/tools` and its student data according to the existing authentication model. If it is public, only expose fields the existing portal explicitly treats as public.
- Do not add an insecure admin bypass.
- Do not put database service keys or secrets in client-side code.

## Implementation Instructions

1. Inspect the current codebase, routes, student schema, data source, logo paths, and package dependencies.
2. Summarise the relevant existing architecture briefly before making changes.
3. Implement the `/tools` route and add Tools to the existing navigation.
4. Reuse the portal's existing students and student data source.
5. Build the responsive UI to match the provided reference while preserving the current site's styling.
6. Implement filters and selection state.
7. Implement document options and a real live preview.
8. Implement genuine PDF download and print.
9. Test all interactions and viewport sizes.
10. Update the project README with any new dependency, setup, and usage notes.

Do not rewrite unrelated pages or remove existing features. Avoid large refactors unless they are required for correctness.

## Acceptance Checklist

The work is complete only when all of these are true:

- [ ] `/tools` loads and matches the existing portal design.
- [ ] Tools appears in the navbar and the active state works.
- [ ] Existing Home, Students, Modules, Events, and Contact navigation still works.
- [ ] All Students, TPOPT Only, TPRPT Only, and Selected Students modes work.
- [ ] Search and supported filters work correctly.
- [ ] Individual selection, select-all-filtered, clear selection, and selected counts work.
- [ ] The Simple List contains `No.`, `Name`, `Tel. No`, and an intentionally blank bordered column.
- [ ] The three heading lines are centred and editable as specified.
- [ ] The preview updates when settings and student selection change.
- [ ] Multi-page preview/navigation works when required.
- [ ] Generate PDF downloads a genuine PDF with the correct students and settings.
- [ ] Print/Preview opens a clean print layout.
- [ ] Missing telephone numbers stay blank; no sample personal details are fabricated.
- [ ] PDF pagination, page margins, blank rows, and table borders are correct.
- [ ] Mobile UI works without horizontal overflow.
- [ ] No dead buttons, broken logo paths, or console errors remain.
- [ ] Existing student data and unrelated pages remain intact.
- [ ] Any backend/configuration limitations are documented honestly.

## Final instruction to Antigravity

Implement this feature in the existing project, not as a separate static demo. Prioritise correctness of student selection, the live print preview, and PDF output. Use the attached UI reference as a visual guide, inspect the actual project before coding, preserve existing functionality, and report which acceptance checks you completed and any remaining setup needed.
