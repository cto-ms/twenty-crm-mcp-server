# Employee Setup Guide — Twenty CRM MCP Server

This guide walks you through connecting Claude Desktop to the TruePresence CRM so you can manage your pipeline, run coaching debriefs, and enforce stage gates through natural conversation.

Time: ~10 minutes.

---

## Step 1: Install Prerequisites

You need two things installed:

**Node.js 18+** — Check with `node --version` in Terminal. If you don't have it or it's below v18, install from https://nodejs.org (use the LTS version).

**Claude Desktop** — Download from https://claude.ai/download if you don't already have it.

---

## Step 2: Get Your CRM API Key

1. Go to https://crm.truepresence.com
2. Log in with your account
3. Click the gear icon (Settings) in the bottom-left
4. Go to **API & Webhooks** (under Developers)
5. Click **Generate API Key**
6. Copy the key — you'll need it in Step 4

Keep this key private. Don't share it or commit it to any files.

---

## Step 3: Clone and Install the MCP Server

Open Terminal and run:

```bash
cd ~/Projects
git clone https://github.com/cto-ms/twenty-crm-mcp-server.git
cd twenty-crm-mcp-server
npm install
```

If you don't have a `~/Projects` folder, create one first (`mkdir -p ~/Projects`) or use any directory you prefer. Just remember the full path — you'll need it next.

To find your full path, run:

```bash
pwd
```

It will show something like `/Users/yourname/Projects/twenty-crm-mcp-server`.

---

## Step 4: Configure Claude Desktop

Open the Claude Desktop config file. In Terminal:

```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

If the file doesn't exist yet, create it:

```bash
mkdir -p ~/Library/Application\ Support/Claude
echo '{}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add (or merge into) the `mcpServers` section. Replace the two placeholder values:

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/Users/YOURNAME/Projects/twenty-crm-mcp-server/index.js"],
      "env": {
        "TWENTY_API_KEY": "PASTE_YOUR_API_KEY_HERE",
        "TWENTY_BASE_URL": "https://crm.truepresence.com"
      }
    }
  }
}
```

Replace:
- `/Users/YOURNAME/Projects/...` with the actual path from Step 3
- `PASTE_YOUR_API_KEY_HERE` with the API key from Step 2

If you already have other MCP servers configured, add the `"twenty-crm"` block inside the existing `"mcpServers"` object — don't replace the whole file.

Save and close the file.

---

## Step 5: Restart Claude Desktop

Quit Claude Desktop completely (Cmd+Q, not just close the window), then reopen it. The MCP server starts automatically.

You should see "twenty-crm" listed when you click the MCP icon (hammer/wrench) in the Claude Desktop input area. If you see 26 tools, you're good.

---

## Step 6: Verify It Works

Type any of these into Claude Desktop:

```
How does my pipeline look?
```

```
Show me all stalled deals
```

```
Debrief the Arch of Cinci opportunity
```

If you get CRM data back, you're connected.

---

## What You Can Do

Here are the key things to try:

**Pipeline overview:**
> "How does my pipeline look?"
> "Show me deals stalled more than 7 days"
> "Which deals have Happy Ears?"

**Stage-gate checks:**
> "Can the Elijah Institute deal advance to 3rd base?"
> "Validate stage advance for Legionaries to fully qualified"

**Coaching debriefs:**
> "Coach me on the DMU Sterling deal"
> "Run a L.E.A.D.S. debrief on Arch of Cinci"
> "Generate a coaching report for the Ascension Calgary opportunity"

**Pipeline maintenance:**
> "Flag all 2nd-base deals missing a compelling reason"
> "What deals have no stakeholders mapped?"

**Schema changes (admin only):**
> "Add a boolean field called contractSigned to opportunities"

You don't need to know opportunity IDs — Claude looks them up by name.

---

## Troubleshooting

**"No MCP servers found" or twenty-crm not listed:**
- Check that the config file path and JSON syntax are correct
- Make sure Node.js is installed: `node --version`
- Try running the server manually to see errors: `TWENTY_API_KEY=your_key TWENTY_BASE_URL=https://crm.truepresence.com node ~/Projects/twenty-crm-mcp-server/index.js`

**"TWENTY_API_KEY environment variable is required":**
- Your API key is missing from the config. Re-edit the config file and make sure the key is there.

**"401 Unauthorized" or "UNAUTHENTICATED":**
- Your API key is invalid or expired. Generate a new one from CRM Settings > API & Webhooks.

**Tools work but return empty data:**
- Make sure `TWENTY_BASE_URL` is set to `https://crm.truepresence.com` (not the default `https://api.twenty.com`).

**Need to update to a new version:**
```bash
cd ~/Projects/twenty-crm-mcp-server
git pull
npm install
```
Then restart Claude Desktop.

---

## Running the Test Suite

To verify all tools are working:

```bash
cd ~/Projects/twenty-crm-mcp-server
TWENTY_API_KEY=your_key TWENTY_BASE_URL=https://crm.truepresence.com node test-tools.js
```

This runs read-only tests against the live CRM (no data is changed). You should see all green checkmarks.
