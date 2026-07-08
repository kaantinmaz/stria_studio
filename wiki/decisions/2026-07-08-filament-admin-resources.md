# Decision: Filament v4 admin resources for Post/Category/Tag

**Date:** 2026-07-08

## Context
Task B4 needed admin CRUD for the blog domain (`Post`, `Category`, `Tag` — models/migrations already existed). Filament v4.11.8 is installed, panel `admin` at `:8002/admin` (`backend/app/Providers/Filament/AdminPanelProvider.php`). This **supersedes** the 2026-07-07 decision "No admin UI (YAGNI) — leads viewed directly in MySQL": that call stood only while the blog didn't exist yet; Filament was added specifically to give bilingual content editing a UI instead of hand-writing SQL/tinker for every post.

## Decisions
- **Resources generated via `make:filament-resource`**, one per model, under `backend/app/Filament/Resources/{Categories,Posts,Tags}/`.
- **Filament 4.11's generator produces a split-class structure**, not the single-file `form()`/`table()` pattern from Filament v3 docs/tutorials:
  ```
  Resources/Posts/
  ├── PostResource.php                 → routes; delegates to Form/Table classes
  ├── Schemas/PostForm.php             → form definition
  ├── Tables/PostsTable.php            → table definition
  └── Pages/{List,Create,Edit}Post.php → generator defaults, rarely need edits
  ```
- **Namespace map for v4.11** (verified against `vendor/filament/**`, not from memory/docs — v3 tutorials and generic Filament code snippets get these wrong):
  | Concept | v4.11 namespace |
  |---|---|
  | Form schema type | `Filament\Schemas\Schema` (method: `form(Schema $schema): Schema`) |
  | Top-level field list | `$schema->components([...])` |
  | Tabs layout | `Filament\Schemas\Components\Tabs` + `Tabs\Tab` (schema-layout, not a form field) |
  | Reactive form `Set`/`Get` | `Filament\Schemas\Components\Utilities\{Set,Get}` |
  | Form fields (TextInput, Textarea, RichEditor, FileUpload, Select, Toggle, DateTimePicker) | `Filament\Forms\Components\*` — unchanged from v3 |
  | Table + columns/filters | `Filament\Tables\Table`, `Filament\Tables\Columns\*`, `Filament\Tables\Filters\*` — unchanged |
  | Table row/bulk actions | `Filament\Actions\*` (moved out of `Filament\Tables\Actions`); wired via `->recordActions()` / `->toolbarActions()`, not `->actions()`/`->bulkActions()` |
- **Post form**: TR/EN tabs (title/excerpt/body) + SEO tab (slug, meta title/desc TR+EN), cover `FileUpload` → `public` disk, `covers/` dir, `category_id` single `Select` (belongsTo, searchable+preload), `tags` multi `Select` (belongsToMany via `relationship('tags', 'name_tr')->multiple()`), `is_published` `Toggle`, `published_at` `DateTimePicker`. Slug auto-fills from `title_tr` via `live(onBlur: true)` + `afterStateUpdated` + `Set`, and is `unique(ignoreRecord: true)`.
- **Category/Tag forms**: generator's `--generate` scaffolding was already correct (`name_tr`, `name_en`, `slug`); only added `->unique(ignoreRecord: true)` on `slug`.
- **Demo data seeded** directly (not a factory/seeder file — one-off tinker run): Category id 1 (`studio-updates`), Tag id 1 (`launch`), Post id 1 (`stria-studio-launches`, published, tag attached). Confirms `Post::published()` scope and the Filament relationship Selects both round-trip through real data.

## Consequences
- Any future Filament resource in this repo should follow the same split-class shape and namespace table above — don't copy v3-era snippets or brief/spec pseudocode without checking `vendor/filament/**` first, since v4.11 renamed several core concepts (`Form` → `Schema`, `Tables\Actions` → `Actions`, tab components moved to the `Schemas` package).
- `public/storage` symlink now required (`php artisan storage:link`) for cover images; it's gitignored (`backend/.gitignore: /public/storage`), each environment must run the command itself.

## Sources
`backend/app/Filament/Resources/{Categories,Posts,Tags}/**` (code) · `backend/vendor/filament/{forms,schemas,tables}/src/**` (v4.11.8, verified 2026-07-08) · `.superpowers/sdd/task-B4-brief.md` · `.superpowers/sdd/task-B4-report.md` · supersedes [[2026-07-07-stack-and-dev-servers]] §"No admin UI"
