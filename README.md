# Twenty CRM MCP Server — TruePresence Fork

MCP server for [Twenty CRM](https://twenty.com) with Kurlan baseball diamond methodology and Rosen L.E.A.D.S. coaching built in. Connects your CRM to Claude Desktop so you can manage pipeline, enforce stage gates, and coach deals through natural language.

Based on [mhenry3164/twenty-crm-mcp-server](https://github.com/mhenry3164/twenty-crm-mcp-server) (MIT License).

## What's Added

Six custom tools on top of the community CRUD operations:

| Tool | What it does |
|------|-------------|
| `get_pipeline_health` | Scans all opportunities. Flags Happy Ears (stage advanced without qualification), Stalls (no activity in N days), Blue Real Estate (compelling reason but no monetized pain). |
| `validate_stage_advance` | Stage-gate enforcement. Checks all required fields before advancing to the next base. Dry-run by default; `force=true` advances anyway and sets a Stage Violation Flag with audit trail. |
| `coach_opportunity_debrief` | Pulls deal data, stakeholders, and activity history. Generates L.E.A.D.S. coaching questions (Listen, Empathize, Ask, Discuss, Support) based on actual qualification gaps. |
| `generate_coaching_artifact` | Same analysis as the debrief but outputs a styled HTML report with diamond position SVG, qualification heatmap, stakeholder table, and coaching questions. |
| `bulk_field_update` | Batch-update a field across opportunities matching filters (stage, stall days, company, amount). Dry-run by default. |
| `add_schema_field` | Add custom fields to any CRM object via the metadata API. No Settings UI needed. |

Plus the original 20 community tools: full CRUD for People, Companies, Tasks, Notes, metadata discovery, and cross-object search.

## Prerequisites

- Node.js 18+
- Access to the TruePresence Twenty CRM instance (crm.truepresence.com)
- Claude Desktop installed
- A Twenty CRM API key (get one from Settings > API & Webhooks in the CRM)

## Setup

**See [SETUP.md](SETUP.md) for step-by-step employee deployment instructions.**

Quick version:

```bash
git clone https://github.com/YOUR_ORG/twenty-crm-mcp-server.git
cd twenty-crm-mcp-server
npm install
```

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/full/path/to/twenty-crm-mcp-server/index.js"],
      "env": {
        "TWENTY_API_KEY": "your_api_key_here",
        "TWENTY_BASE_URL": "https://crm.truepresence.com"
      }
    }
  }
}
```

Restart Claude Desktop. The tools appear automatically.

## Usage

You don't need to memorize tool names or opportunity IDs. Just talk to Claude:

```
"How does my pipeline look?"
"Can the Legionaries deal advance to 3rd base?"
"Debrief the Arch of Cinci opportunity"
"Show me all stalled deals over 14 days"
"Flag every 2nd-base deal that's missing a compelling reason"
"Add a boolean field called contractSigned to opportunities"
```

Claude finds the right IDs, calls the right tools, and presents the results.

## Diamond Stages

| Stage Enum | Base | What's Required |
|-----------|------|----------------|
| `HOME_PROSPECT_IDENTIFIED` | Home (start) | — |
| `OPT1ST_MEETING_BOOKED` | 1st | Meeting booked |
| `OPT2ND_COMPELLING_REASON` | 2nd | Compelling reason identified + text, pain monetized |
| `OPT3RD_FULLY_QUALIFIED` | 3rd | All of 2nd + investment conversation, decision maker, criteria, timeline, target date |
| `HOME_CLOSED_WON` | Home (score) | All of 3rd + deal amount + close date |

## Testing

Run the test suite (read-only, no CRM data modified):

```bash
TWENTY_API_KEY=your_key TWENTY_BASE_URL=https://crm.truepresence.com node test-tools.js
```

Optionally pass an opportunity ID to test against a specific deal:

```bash
node test-tools.js b35d493f-6307-43e9-becd-4829c04bbdec
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWENTY_API_KEY` | Yes | — | Your Twenty CRM API key |
| `TWENTY_BASE_URL` | No | `https://api.twenty.com` | Your CRM instance URL |

## License

MIT — see original repo for full license text.
