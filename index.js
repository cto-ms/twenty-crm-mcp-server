#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class TwentyCRMServer {
  constructor() {
    this.server = new Server(
      {
        name: "twenty-crm",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.TWENTY_API_KEY;
    this.baseUrl = process.env.TWENTY_BASE_URL || "https://api.twenty.com";
    
    if (!this.apiKey) {
      throw new Error("TWENTY_API_KEY environment variable is required");
    }

    this.setupToolHandlers();
  }

  async makeRequest(endpoint, method = "GET", data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // People Management
          {
            name: "create_person",
            description: "Create a new person in Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                firstName: { type: "string", description: "First name" },
                lastName: { type: "string", description: "Last name" },
                email: { type: "string", description: "Email address" },
                phone: { type: "string", description: "Phone number" },
                jobTitle: { type: "string", description: "Job title" },
                companyId: { type: "string", description: "Company ID to associate with" },
                linkedinUrl: { type: "string", description: "LinkedIn profile URL" },
                city: { type: "string", description: "City" },
                avatarUrl: { type: "string", description: "Avatar image URL" }
              },
              required: ["firstName", "lastName"]
            }
          },
          {
            name: "get_person",
            description: "Get details of a specific person by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Person ID" }
              },
              required: ["id"]
            }
          },
          {
            name: "update_person",
            description: "Update an existing person's information",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Person ID" },
                firstName: { type: "string", description: "First name" },
                lastName: { type: "string", description: "Last name" },
                email: { type: "string", description: "Email address" },
                phone: { type: "string", description: "Phone number" },
                jobTitle: { type: "string", description: "Job title" },
                companyId: { type: "string", description: "Company ID" },
                linkedinUrl: { type: "string", description: "LinkedIn profile URL" },
                city: { type: "string", description: "City" }
              },
              required: ["id"]
            }
          },
          {
            name: "list_people",
            description: "List people with optional filtering and pagination",
            inputSchema: {
              type: "object",
              properties: {
                limit: { type: "number", description: "Number of results to return (default: 20)" },
                offset: { type: "number", description: "Number of results to skip (default: 0)" },
                search: { type: "string", description: "Search term for name or email" },
                companyId: { type: "string", description: "Filter by company ID" }
              }
            }
          },
          {
            name: "delete_person",
            description: "Delete a person from Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Person ID to delete" }
              },
              required: ["id"]
            }
          },

          // Company Management
          {
            name: "create_company",
            description: "Create a new company in Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Company name" },
                domainName: { type: "string", description: "Company domain" },
                address: { type: "string", description: "Company address" },
                employees: { type: "number", description: "Number of employees" },
                linkedinUrl: { type: "string", description: "LinkedIn company URL" },
                xUrl: { type: "string", description: "X (Twitter) URL" },
                annualRecurringRevenue: { type: "number", description: "Annual recurring revenue" },
                idealCustomerProfile: { type: "boolean", description: "Is this an ideal customer profile" }
              },
              required: ["name"]
            }
          },
          {
            name: "get_company",
            description: "Get details of a specific company by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Company ID" }
              },
              required: ["id"]
            }
          },
          {
            name: "update_company",
            description: "Update an existing company's information",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Company ID" },
                name: { type: "string", description: "Company name" },
                domainName: { type: "string", description: "Company domain" },
                address: { type: "string", description: "Company address" },
                employees: { type: "number", description: "Number of employees" },
                linkedinUrl: { type: "string", description: "LinkedIn company URL" },
                annualRecurringRevenue: { type: "number", description: "Annual recurring revenue" }
              },
              required: ["id"]
            }
          },
          {
            name: "list_companies",
            description: "List companies with optional filtering and pagination",
            inputSchema: {
              type: "object",
              properties: {
                limit: { type: "number", description: "Number of results to return (default: 20)" },
                offset: { type: "number", description: "Number of results to skip (default: 0)" },
                search: { type: "string", description: "Search term for company name" }
              }
            }
          },
          {
            name: "delete_company",
            description: "Delete a company from Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Company ID to delete" }
              },
              required: ["id"]
            }
          },

          // Notes Management
          {
            name: "create_note",
            description: "Create a new note in Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Note title" },
                body: { type: "string", description: "Note content" },
                position: { type: "number", description: "Position for ordering" }
              },
              required: ["title", "body"]
            }
          },
          {
            name: "get_note",
            description: "Get details of a specific note by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Note ID" }
              },
              required: ["id"]
            }
          },
          {
            name: "list_notes",
            description: "List notes with optional filtering and pagination",
            inputSchema: {
              type: "object",
              properties: {
                limit: { type: "number", description: "Number of results to return (default: 20)" },
                offset: { type: "number", description: "Number of results to skip (default: 0)" },
                search: { type: "string", description: "Search term for note title or content" }
              }
            }
          },
          {
            name: "update_note",
            description: "Update an existing note",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Note ID" },
                title: { type: "string", description: "Note title" },
                body: { type: "string", description: "Note content" },
                position: { type: "number", description: "Position for ordering" }
              },
              required: ["id"]
            }
          },
          {
            name: "delete_note",
            description: "Delete a note from Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Note ID to delete" }
              },
              required: ["id"]
            }
          },

          // Tasks Management
          {
            name: "create_task",
            description: "Create a new task in Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Task title" },
                body: { type: "string", description: "Task description" },
                dueAt: { type: "string", description: "Due date (ISO 8601 format)" },
                status: { type: "string", description: "Task status", enum: ["TODO", "IN_PROGRESS", "DONE"] },
                assigneeId: { type: "string", description: "ID of person assigned to task" },
                position: { type: "number", description: "Position for ordering" }
              },
              required: ["title"]
            }
          },
          {
            name: "get_task",
            description: "Get details of a specific task by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Task ID" }
              },
              required: ["id"]
            }
          },
          {
            name: "list_tasks",
            description: "List tasks with optional filtering and pagination",
            inputSchema: {
              type: "object",
              properties: {
                limit: { type: "number", description: "Number of results to return (default: 20)" },
                offset: { type: "number", description: "Number of results to skip (default: 0)" },
                status: { type: "string", description: "Filter by status", enum: ["TODO", "IN_PROGRESS", "DONE"] },
                assigneeId: { type: "string", description: "Filter by assignee ID" }
              }
            }
          },
          {
            name: "update_task",
            description: "Update an existing task",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Task ID" },
                title: { type: "string", description: "Task title" },
                body: { type: "string", description: "Task description" },
                dueAt: { type: "string", description: "Due date (ISO 8601 format)" },
                status: { type: "string", description: "Task status", enum: ["TODO", "IN_PROGRESS", "DONE"] },
                assigneeId: { type: "string", description: "ID of person assigned to task" }
              },
              required: ["id"]
            }
          },
          {
            name: "delete_task",
            description: "Delete a task from Twenty CRM",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", description: "Task ID to delete" }
              },
              required: ["id"]
            }
          },

          // Metadata Operations
          {
            name: "get_metadata_objects",
            description: "Get all object types and their metadata",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_object_metadata",
            description: "Get metadata for a specific object type",
            inputSchema: {
              type: "object",
              properties: {
                objectName: { type: "string", description: "Object name (e.g., 'people', 'companies')" }
              },
              required: ["objectName"]
            }
          },

          // Stage-Gate Enforcement (Kurlan methodology)
          {
            name: "validate_stage_advance",
            description: "Stage-gate enforcement for the Kurlan baseball diamond. Checks all milestone fields required for advancing to the target stage. Default is dry-run (read-only preview of gaps). Set force=true to advance the stage anyway — this sets Stage Violation Flag and writes an audit activity log. Use opportunityId + targetStage.",
            inputSchema: {
              type: "object",
              properties: {
                opportunityId: { type: "string", description: "Opportunity ID to validate" },
                targetStage: {
                  type: "string",
                  description: "Stage to advance to",
                  enum: [
                    "OPT1ST_MEETING_BOOKED",
                    "OPT2ND_COMPELLING_REASON",
                    "OPT3RD_FULLY_QUALIFIED",
                    "HOME_CLOSED_WON"
                  ]
                },
                force: { type: "boolean", description: "If true, advance stage even with gaps (sets Stage Violation Flag). Default: false (dry-run)." }
              },
              required: ["opportunityId", "targetStage"]
            }
          },

          // Pipeline Health (Kurlan/Rosen methodology)
          {
            name: "get_pipeline_health",
            description: "Scan all opportunities and produce a pipeline health report. Flags: Happy Ears (stage advanced but qualification fields empty), Stalls (no activity in N days at current stage), Blue Real Estate (Compelling Reason identified but Pain Monetized Amount missing). Read-only, no side effects.",
            inputSchema: {
              type: "object",
              properties: {
                stallThresholdDays: { type: "number", description: "Days without activity before flagging a stall (default: 14)" },
                stage: { type: "string", description: "Filter to a specific stage (optional)" }
              }
            }
          },

          // Coach Opportunity Debrief (Rosen L.E.A.D.S.)
          {
            name: "coach_opportunity_debrief",
            description: "Generate a Rosen L.E.A.D.S. coaching debrief for an opportunity. Pulls the deal's diamond position, qualification gaps, stakeholder map, and recent activity, then produces targeted coaching questions across Listen, Empathize, Ask, Discuss, Support. Optionally writes a debrief summary to the Activity Log.",
            inputSchema: {
              type: "object",
              properties: {
                opportunityId: { type: "string", description: "Opportunity ID to debrief" },
                writeLog: { type: "boolean", description: "If true, write a debrief summary activity log entry (default: false — read-only)." }
              },
              required: ["opportunityId"]
            }
          },

          // Generate Coaching Artifact (HTML report)
          {
            name: "generate_coaching_artifact",
            description: "Generate a styled HTML coaching report for an opportunity. Runs the same analysis as coach_opportunity_debrief but returns a self-contained HTML document suitable for sharing, printing, or embedding. Includes diamond position, qualification heatmap, stakeholder map, activity pulse, and L.E.A.D.S. coaching questions.",
            inputSchema: {
              type: "object",
              properties: {
                opportunityId: { type: "string", description: "Opportunity ID to generate the report for" }
              },
              required: ["opportunityId"]
            }
          },

          // Bulk Field Update
          {
            name: "bulk_field_update",
            description: "Batch-update a single field across multiple opportunities matching a filter. Useful for pipeline cleanup (e.g., flag all stalled deals, reset stages, update close dates). Returns a summary of updated records. Use with caution — this writes data.",
            inputSchema: {
              type: "object",
              properties: {
                filter: {
                  type: "object",
                  description: "Filter criteria. Supported keys: stage (exact match), stallDaysMin (minimum days since last activity), companyId (exact match), hasAmount (boolean — true=has amount, false=missing).",
                  properties: {
                    stage: { type: "string", description: "Filter by stage enum value" },
                    stallDaysMin: { type: "number", description: "Minimum days since last activity to match" },
                    companyId: { type: "string", description: "Filter by company ID" },
                    hasAmount: { type: "boolean", description: "true = has deal amount, false = no deal amount" }
                  }
                },
                field: { type: "string", description: "Field name to update (camelCase, e.g., 'stageViolationFlag', 'timelineAgreed')" },
                value: { description: "Value to set. Type must match the field (boolean, string, number, or {amountMicros, currencyCode} for currency fields)." },
                dryRun: { type: "boolean", description: "If true (default), just report which records would be updated without changing anything." }
              },
              required: ["filter", "field", "value"]
            }
          },

          // Add Schema Field
          {
            name: "add_schema_field",
            description: "Add a new custom field to any Twenty CRM object via the metadata API. Supports TEXT, NUMBER, BOOLEAN, DATE_TIME, CURRENCY, RATING, SELECT, MULTI_SELECT, RELATION, LINKS, EMAILS, PHONES, and more. Returns the created field metadata.",
            inputSchema: {
              type: "object",
              properties: {
                objectName: { type: "string", description: "Singular object name (e.g., 'opportunity', 'person', 'company')" },
                fieldName: { type: "string", description: "camelCase field name (e.g., 'painMonetizedAmount')" },
                label: { type: "string", description: "Human-readable label (e.g., 'Pain Monetized Amount')" },
                type: {
                  type: "string",
                  description: "Field data type",
                  enum: ["TEXT", "NUMBER", "BOOLEAN", "DATE_TIME", "CURRENCY", "RATING", "SELECT", "MULTI_SELECT", "RELATION", "LINKS", "EMAILS", "PHONES", "FULL_NAME", "ADDRESS"]
                },
                description: { type: "string", description: "Field description (optional)" },
                icon: { type: "string", description: "Icon name from Twenty's icon set (optional, e.g., 'IconCurrencyDollar')" },
                options: {
                  type: "array",
                  description: "For SELECT/MULTI_SELECT fields — array of {value, label, color} option objects.",
                  items: {
                    type: "object",
                    properties: {
                      value: { type: "string" },
                      label: { type: "string" },
                      color: { type: "string", description: "Color name (e.g., 'green', 'red', 'blue', 'yellow')" }
                    },
                    required: ["value", "label"]
                  }
                }
              },
              required: ["objectName", "fieldName", "label", "type"]
            }
          },

          // Search and Enrichment
          {
            name: "search_records",
            description: "Search across multiple object types",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
                objectTypes: {
                  type: "array",
                  items: { type: "string" },
                  description: "Object types to search (e.g., ['people', 'companies'])"
                },
                limit: { type: "number", description: "Number of results per object type" }
              },
              required: ["query"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // People operations
          case "create_person":
            return await this.createPerson(args);
          case "get_person":
            return await this.getPerson(args.id);
          case "update_person":
            return await this.updatePerson(args);
          case "list_people":
            return await this.listPeople(args);
          case "delete_person":
            return await this.deletePerson(args.id);

          // Company operations
          case "create_company":
            return await this.createCompany(args);
          case "get_company":
            return await this.getCompany(args.id);
          case "update_company":
            return await this.updateCompany(args);
          case "list_companies":
            return await this.listCompanies(args);
          case "delete_company":
            return await this.deleteCompany(args.id);

          // Note operations
          case "create_note":
            return await this.createNote(args);
          case "get_note":
            return await this.getNote(args.id);
          case "list_notes":
            return await this.listNotes(args);
          case "update_note":
            return await this.updateNote(args);
          case "delete_note":
            return await this.deleteNote(args.id);

          // Task operations
          case "create_task":
            return await this.createTask(args);
          case "get_task":
            return await this.getTask(args.id);
          case "list_tasks":
            return await this.listTasks(args);
          case "update_task":
            return await this.updateTask(args);
          case "delete_task":
            return await this.deleteTask(args.id);

          // Metadata operations
          case "get_metadata_objects":
            return await this.getMetadataObjects();
          case "get_object_metadata":
            return await this.getObjectMetadata(args.objectName);

          // Stage-gate enforcement
          case "validate_stage_advance":
            return await this.validateStageAdvance(args);

          // Pipeline health
          case "get_pipeline_health":
            return await this.getPipelineHealth(args);

          // Coach opportunity debrief
          case "coach_opportunity_debrief":
            return await this.coachOpportunityDebrief(args);

          // Generate coaching artifact (HTML)
          case "generate_coaching_artifact":
            return await this.generateCoachingArtifact(args);

          // Bulk field update
          case "bulk_field_update":
            return await this.bulkFieldUpdate(args);

          // Add schema field
          case "add_schema_field":
            return await this.addSchemaField(args);

          // Search operations
          case "search_records":
            return await this.searchRecords(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  // People methods
  async createPerson(data) {
    const result = await this.makeRequest("/rest/people", "POST", data);
    return {
      content: [
        {
          type: "text",
          text: `Created person: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async getPerson(id) {
    const result = await this.makeRequest(`/rest/people/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `Person details: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async updatePerson(data) {
    const { id, ...updateData } = data;
    const result = await this.makeRequest(`/rest/people/${id}`, "PUT", updateData);
    return {
      content: [
        {
          type: "text",
          text: `Updated person: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async listPeople(params = {}) {
    const { limit = 20, offset = 0, search, companyId } = params;
    let endpoint = `/rest/people?limit=${limit}&offset=${offset}`;
    
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    if (companyId) {
      endpoint += `&companyId=${companyId}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      content: [
        {
          type: "text",
          text: `People list: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async deletePerson(id) {
    await this.makeRequest(`/rest/people/${id}`, "DELETE");
    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted person with ID: ${id}`
        }
      ]
    };
  }

  // Company methods
  async createCompany(data) {
    const result = await this.makeRequest("/rest/companies", "POST", data);
    return {
      content: [
        {
          type: "text",
          text: `Created company: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async getCompany(id) {
    const result = await this.makeRequest(`/rest/companies/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `Company details: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async updateCompany(data) {
    const { id, ...updateData } = data;
    const result = await this.makeRequest(`/rest/companies/${id}`, "PUT", updateData);
    return {
      content: [
        {
          type: "text",
          text: `Updated company: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async listCompanies(params = {}) {
    const { limit = 20, offset = 0, search } = params;
    let endpoint = `/rest/companies?limit=${limit}&offset=${offset}`;
    
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      content: [
        {
          type: "text",
          text: `Companies list: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async deleteCompany(id) {
    await this.makeRequest(`/rest/companies/${id}`, "DELETE");
    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted company with ID: ${id}`
        }
      ]
    };
  }

  // Note methods
  async createNote(data) {
    const result = await this.makeRequest("/rest/notes", "POST", data);
    return {
      content: [
        {
          type: "text",
          text: `Created note: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async getNote(id) {
    const result = await this.makeRequest(`/rest/notes/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `Note details: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async listNotes(params = {}) {
    const { limit = 20, offset = 0, search } = params;
    let endpoint = `/rest/notes?limit=${limit}&offset=${offset}`;
    
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      content: [
        {
          type: "text",
          text: `Notes list: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async updateNote(data) {
    const { id, ...updateData } = data;
    const result = await this.makeRequest(`/rest/notes/${id}`, "PUT", updateData);
    return {
      content: [
        {
          type: "text",
          text: `Updated note: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async deleteNote(id) {
    await this.makeRequest(`/rest/notes/${id}`, "DELETE");
    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted note with ID: ${id}`
        }
      ]
    };
  }

  // Task methods
  async createTask(data) {
    const result = await this.makeRequest("/rest/tasks", "POST", data);
    return {
      content: [
        {
          type: "text",
          text: `Created task: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async getTask(id) {
    const result = await this.makeRequest(`/rest/tasks/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `Task details: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async listTasks(params = {}) {
    const { limit = 20, offset = 0, status, assigneeId } = params;
    let endpoint = `/rest/tasks?limit=${limit}&offset=${offset}`;
    
    if (status) {
      endpoint += `&status=${status}`;
    }
    if (assigneeId) {
      endpoint += `&assigneeId=${assigneeId}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      content: [
        {
          type: "text",
          text: `Tasks list: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async updateTask(data) {
    const { id, ...updateData } = data;
    const result = await this.makeRequest(`/rest/tasks/${id}`, "PUT", updateData);
    return {
      content: [
        {
          type: "text",
          text: `Updated task: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async deleteTask(id) {
    await this.makeRequest(`/rest/tasks/${id}`, "DELETE");
    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted task with ID: ${id}`
        }
      ]
    };
  }

  // Metadata methods
  async getMetadataObjects() {
    const result = await this.makeRequest("/rest/metadata/objects");
    return {
      content: [
        {
          type: "text",
          text: `Metadata objects: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async getObjectMetadata(objectName) {
    const result = await this.makeRequest(`/rest/metadata/objects/${objectName}`);
    return {
      content: [
        {
          type: "text",
          text: `Metadata for ${objectName}: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  // Search methods
  async searchRecords(params) {
    const { query, objectTypes = ['people', 'companies'], limit = 10 } = params;
    const results = {};

    for (const objectType of objectTypes) {
      try {
        const endpoint = `/rest/${objectType}?search=${encodeURIComponent(query)}&limit=${limit}`;
        results[objectType] = await this.makeRequest(endpoint);
      } catch (error) {
        results[objectType] = { error: error.message };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Search results for "${query}": ${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  // Stage-Gate Enforcement — Kurlan baseball diamond
  async validateStageAdvance(params) {
    const { opportunityId, targetStage, force = false } = params;

    // Stage ordering
    const STAGES = [
      "HOME_PROSPECT_IDENTIFIED",
      "OPT1ST_MEETING_BOOKED",
      "OPT2ND_COMPELLING_REASON",
      "OPT3RD_FULLY_QUALIFIED",
      "HOME_CLOSED_WON"
    ];
    const stageIndex = (s) => {
      const idx = STAGES.indexOf(s);
      return idx >= 0 ? idx : -1;
    };

    if (!STAGES.includes(targetStage)) {
      return {
        content: [{ type: "text", text: `Error: Unknown target stage "${targetStage}". Valid stages: ${STAGES.join(", ")}` }]
      };
    }

    // Fetch the opportunity
    const oppResult = await this.makeRequest(`/rest/opportunities/${opportunityId}`);
    const opp = oppResult.data?.opportunity || oppResult.data || oppResult;

    if (!opp || !opp.id) {
      return {
        content: [{ type: "text", text: `Error: Opportunity ${opportunityId} not found.` }]
      };
    }

    const currentStage = opp.stage || "UNKNOWN";
    const currentIdx = stageIndex(currentStage);
    const targetIdx = stageIndex(targetStage);

    if (targetIdx <= currentIdx) {
      return {
        content: [{ type: "text", text: `Opportunity "${opp.name}" is already at ${currentStage} (index ${currentIdx}). Target ${targetStage} (index ${targetIdx}) is not an advancement. No action taken.` }]
      };
    }

    // Define gate requirements per target stage
    const gates = {};

    // To reach 2nd base — Compelling Reason
    gates["OPT2ND_COMPELLING_REASON"] = [
      {
        field: "compellingReasonIdentified",
        label: "Compelling Reason Identified",
        check: (o) => o.compellingReasonIdentified === true
      },
      {
        field: "compellingReasonText",
        label: "Compelling Reason (Text)",
        check: (o) => !!o.compellingReasonText && o.compellingReasonText.trim() !== ""
      },
      {
        field: "painMonetizedAmount",
        label: "Pain Monetized Amount",
        check: (o) => o.painMonetizedAmount?.amountMicros != null && o.painMonetizedAmount.amountMicros > 0
      }
    ];

    // To reach 3rd base — Fully Qualified (all of 2nd + more)
    gates["OPT3RD_FULLY_QUALIFIED"] = [
      ...gates["OPT2ND_COMPELLING_REASON"],
      {
        field: "investmentConversationComplete",
        label: "Investment Conversation Complete",
        check: (o) => o.investmentConversationComplete === true
      },
      {
        field: "decisionMakerConfirmed",
        label: "Decision Maker Confirmed",
        check: (o) => o.decisionMakerConfirmed === true
      },
      {
        field: "decisionCriteriaUnderstood",
        label: "Decision Criteria Understood",
        check: (o) => o.decisionCriteriaUnderstood === true
      },
      {
        field: "timelineAgreed",
        label: "Timeline Agreed",
        check: (o) => o.timelineAgreed === true
      },
      {
        field: "targetDecisionDate",
        label: "Target Decision Date",
        check: (o) => !!o.targetDecisionDate
      }
    ];

    // To reach Home / Closed Won — everything + financials
    gates["HOME_CLOSED_WON"] = [
      ...gates["OPT3RD_FULLY_QUALIFIED"],
      {
        field: "amount",
        label: "Deal Amount",
        check: (o) => o.amount?.amountMicros != null && o.amount.amountMicros > 0
      },
      {
        field: "closeDate",
        label: "Close Date",
        check: (o) => !!o.closeDate
      }
    ];

    // 1st base has no gate requirements (just book a meeting)
    gates["OPT1ST_MEETING_BOOKED"] = [];

    const requirements = gates[targetStage] || [];
    const passed = [];
    const failed = [];

    for (const req of requirements) {
      if (req.check(opp)) {
        passed.push({ field: req.field, label: req.label, status: "PASS" });
      } else {
        failed.push({ field: req.field, label: req.label, status: "FAIL" });
      }
    }

    const canAdvance = failed.length === 0;

    // Build the result
    const result = {
      opportunity: opp.name,
      opportunityId: opp.id,
      currentStage,
      targetStage,
      mode: force ? "FORCE" : "DRY_RUN",
      gateCheck: {
        totalRequirements: requirements.length,
        passed: passed.length,
        failed: failed.length,
        canAdvanceClean: canAdvance,
        details: [...passed, ...failed]
      }
    };

    // DRY RUN — just report
    if (!force) {
      if (canAdvance) {
        result.recommendation = `All ${requirements.length} gate requirements met. Safe to advance "${opp.name}" from ${currentStage} to ${targetStage}.`;
      } else {
        result.recommendation = `${failed.length} of ${requirements.length} requirements not met. Fix these before advancing, or use force=true to override (sets Stage Violation Flag).`;
        result.missingFields = failed.map(f => f.label);
      }
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    // FORCE ADVANCE — update the opportunity
    const updatePayload = { stage: targetStage };

    if (!canAdvance) {
      updatePayload.stageViolationFlag = true;
    }

    try {
      await this.makeRequest(`/rest/opportunities/${opportunityId}`, "PATCH", updatePayload);
      result.action = "ADVANCED";
      result.stageViolationFlag = !canAdvance;

      if (!canAdvance) {
        result.warning = `Stage advanced with ${failed.length} unmet requirements. Stage Violation Flag set to true.`;
        result.missingFields = failed.map(f => f.label);
      } else {
        result.message = `Clean advance — all gates passed. Stage updated to ${targetStage}.`;
      }

      // Write audit activity log
      try {
        const logEntry = {
          name: `Stage advance: ${currentStage} → ${targetStage}${!canAdvance ? " (FORCED)" : ""}`,
          date: new Date().toISOString(),
          activityType: "STAGE_ADVANCE",
          notes: canAdvance
            ? `Clean advance. All ${requirements.length} gate requirements met.`
            : `Forced advance with ${failed.length} gaps: ${failed.map(f => f.label).join(", ")}`,
          opportunitiesId: opportunityId
        };

        // Try to map diamond base
        const baseMap = {
          "OPT1ST_MEETING_BOOKED": "FIRST",
          "OPT2ND_COMPELLING_REASON": "SECOND",
          "OPT3RD_FULLY_QUALIFIED": "THIRD",
          "HOME_CLOSED_WON": "HOME_PLATE"
        };
        if (baseMap[targetStage]) {
          logEntry.diamondBaseReached = baseMap[targetStage];
        }

        await this.makeRequest("/rest/activityLogs", "POST", logEntry);
        result.auditLog = "Activity log written successfully.";
      } catch (logErr) {
        result.auditLog = `Warning: Stage updated but activity log failed: ${logErr.message}`;
      }

    } catch (updateErr) {
      result.action = "FAILED";
      result.error = `Stage update failed: ${updateErr.message}`;
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }

  // Pipeline Health — Kurlan/Rosen methodology analysis
  async getPipelineHealth(params = {}) {
    const { stallThresholdDays = 14, stage } = params;
    const now = new Date();

    // Fetch all opportunities (paginate to get them all)
    let allOpps = [];
    let offset = 0;
    const pageSize = 60;
    while (true) {
      const page = await this.makeRequest(`/rest/opportunities?limit=${pageSize}&offset=${offset}`);
      const records = page.data?.opportunities || page.data || page.opportunities || [];
      if (!Array.isArray(records) || records.length === 0) break;
      allOpps = allOpps.concat(records);
      if (records.length < pageSize) break;
      offset += pageSize;
    }

    if (allOpps.length === 0) {
      return {
        content: [{ type: "text", text: "No opportunities found in the pipeline." }]
      };
    }

    // Optionally filter by stage
    let opps = stage
      ? allOpps.filter(o => {
          const s = o.stage?.value || o.stage || "";
          return s.toLowerCase().includes(stage.toLowerCase());
        })
      : allOpps;

    // Fetch activity logs for stall detection
    let allLogs = [];
    try {
      let logOffset = 0;
      while (true) {
        const logPage = await this.makeRequest(`/rest/activityLogs?limit=${pageSize}&offset=${logOffset}`);
        const logRecords = logPage.data?.activityLogs || logPage.data || logPage.activityLogs || [];
        if (!Array.isArray(logRecords) || logRecords.length === 0) break;
        allLogs = allLogs.concat(logRecords);
        if (logRecords.length < pageSize) break;
        logOffset += pageSize;
      }
    } catch (e) {
      // Activity logs may not be fetchable via REST — fall back to lastMeaningfulActivityDate
    }

    // Build a map of opportunity ID → most recent activity date
    const lastActivityByOpp = {};
    for (const log of allLogs) {
      const oppId = log.opportunityId || log.opportunitiesId;
      if (!oppId) continue;
      const logDate = new Date(log.date || log.createdAt);
      if (!lastActivityByOpp[oppId] || logDate > lastActivityByOpp[oppId]) {
        lastActivityByOpp[oppId] = logDate;
      }
    }

    const happyEars = [];
    const stalls = [];
    const blueRealEstate = [];
    const summary = { total: opps.length, byStage: {} };

    // Stage ordering for Kurlan baseball diamond
    const stageOrder = {
      "OPT1ST_MEETING": 1, "1ST_MEETING": 1, "MEETING": 1,
      "OPT2ND_COMPELLING_REASON": 2, "2ND_COMPELLING_REASON": 2, "COMPELLING_REASON": 2,
      "OPT3RD_DECISION_CRITERIA": 3, "3RD_DECISION_CRITERIA": 3, "DECISION_CRITERIA": 3,
      "OPT4TH_PROPOSAL": 4, "4TH_PROPOSAL": 4, "PROPOSAL": 4,
      "OPTHOME_CLOSED": 5, "HOME_CLOSED": 5, "CLOSED": 5, "CLOSED_WON": 5
    };

    for (const opp of opps) {
      const name = opp.name || "Unnamed";
      const oppId = opp.id;
      const stageVal = opp.stage?.value || opp.stage || "UNKNOWN";
      const stageNum = stageOrder[stageVal.toUpperCase()] || stageOrder[stageVal] || 0;

      // Count by stage
      summary.byStage[stageVal] = (summary.byStage[stageVal] || 0) + 1;

      // --- Happy Ears: stage advanced past 1st but qualification fields empty ---
      if (stageNum >= 2) {
        const gaps = [];
        if (!opp.compellingReasonIdentified) gaps.push("Compelling Reason Identified = false");
        if (!opp.compellingReasonText && !opp.compellingReason) gaps.push("Compelling Reason (Text) empty");
        if (stageNum >= 2 && !opp.painMonetizedAmount?.amountMicros && !opp.painMonetizedAmount?.amount) {
          gaps.push("Pain Monetized Amount empty");
        }
        if (stageNum >= 3) {
          if (!opp.investmentConversationComplete) gaps.push("Investment Conversation not complete");
          if (!opp.decisionCriteriaUnderstood) gaps.push("Decision Criteria not understood");
          if (!opp.timelineAgreed) gaps.push("Timeline not agreed");
        }
        if (gaps.length > 0) {
          happyEars.push({ name, id: oppId, stage: stageVal, gaps });
        }
      }

      // --- Blue Real Estate: Compelling Reason marked but no dollar figure ---
      if (opp.compellingReasonIdentified &&
          (!opp.painMonetizedAmount?.amountMicros && !opp.painMonetizedAmount?.amount)) {
        blueRealEstate.push({ name, id: oppId, stage: stageVal });
      }

      // --- Stall Detection ---
      const lastActivity = lastActivityByOpp[oppId]
        || (opp.lastMeaningfulActivityDate ? new Date(opp.lastMeaningfulActivityDate) : null)
        || (opp.updatedAt ? new Date(opp.updatedAt) : null);

      if (lastActivity) {
        const daysSince = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        if (daysSince >= stallThresholdDays) {
          stalls.push({ name, id: oppId, stage: stageVal, daysSinceActivity: daysSince });
        }
      }
    }

    // Sort stalls by most stale first
    stalls.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);

    // Build report
    const report = {
      generatedAt: now.toISOString(),
      stallThresholdDays,
      summary,
      flags: {
        happyEars: {
          count: happyEars.length,
          description: "Stage advanced but qualification fields incomplete",
          items: happyEars
        },
        stalls: {
          count: stalls.length,
          description: `No activity in ${stallThresholdDays}+ days`,
          items: stalls
        },
        blueRealEstate: {
          count: blueRealEstate.length,
          description: "Compelling Reason identified but Pain Monetized Amount missing",
          items: blueRealEstate
        }
      },
      totalFlags: happyEars.length + stalls.length + blueRealEstate.length
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report, null, 2)
        }
      ]
    };
  }

  // ─── Coach Opportunity Debrief (Rosen L.E.A.D.S.) ─────────────────────────
  async coachOpportunityDebrief(params) {
    const { opportunityId, writeLog = false } = params;

    const STAGES = [
      "HOME_PROSPECT_IDENTIFIED",
      "OPT1ST_MEETING_BOOKED",
      "OPT2ND_COMPELLING_REASON",
      "OPT3RD_FULLY_QUALIFIED",
      "HOME_CLOSED_WON"
    ];
    const STAGE_LABELS = {
      HOME_PROSPECT_IDENTIFIED: "Home — Prospect Identified",
      OPT1ST_MEETING_BOOKED: "1st Base — Meeting Booked",
      OPT2ND_COMPELLING_REASON: "2nd Base — Compelling Reason",
      OPT3RD_FULLY_QUALIFIED: "3rd Base — Fully Qualified",
      HOME_CLOSED_WON: "Home — Closed Won"
    };
    const stageIndex = (s) => STAGES.indexOf(s);

    // 1. Fetch the opportunity
    const oppResult = await this.makeRequest(`/rest/opportunities/${opportunityId}`);
    const opp = oppResult.data?.opportunity || oppResult.data || oppResult;

    if (!opp || !opp.id) {
      return {
        content: [{ type: "text", text: `Error: Opportunity ${opportunityId} not found.` }]
      };
    }

    const currentStage = opp.stage || "UNKNOWN";
    const currentIdx = stageIndex(currentStage);
    const stageLabel = STAGE_LABELS[currentStage] || currentStage;

    // 2. Fetch stakeholders for this opportunity (fetch all, filter client-side for API compatibility)
    let stakeholders = [];
    try {
      const stakeholderResult = await this.makeRequest(`/rest/opportunityStakeholders?limit=200`);
      const raw = stakeholderResult.data?.opportunityStakeholders || stakeholderResult.data || [];
      const allStakeholders = Array.isArray(raw) ? raw : [];
      stakeholders = allStakeholders.filter(s => s.opportunityId === opportunityId);
    } catch (e) {
      // Non-fatal — stakeholders may not exist yet
    }

    // Enrich stakeholders with person names
    for (const sh of stakeholders) {
      if (sh.personId) {
        try {
          const personResult = await this.makeRequest(`/rest/people/${sh.personId}`);
          const person = personResult.data?.person || personResult.data || personResult;
          sh._personName = [person.name?.firstName, person.name?.lastName].filter(Boolean).join(" ") || "Unknown";
          sh._personEmail = person.emails?.primaryEmail || "";
        } catch (e) {
          sh._personName = "(could not load)";
        }
      }
    }

    // 3. Fetch recent activity logs for this opportunity (fetch all, filter client-side)
    let activities = [];
    try {
      let allActivities = [];
      let actOffset = 0;
      while (true) {
        const actResult = await this.makeRequest(`/rest/activityLogs?limit=60&offset=${actOffset}`);
        const rawAct = actResult.data?.activityLogs || actResult.data || [];
        const items = Array.isArray(rawAct) ? rawAct : [];
        if (items.length === 0) break;
        allActivities = allActivities.concat(items);
        if (items.length < 60) break;
        actOffset += 60;
      }
      activities = allActivities
        .filter(a => a.opportunityId === opportunityId)
        .sort((a, b) => {
          const da = a.activityDate ? new Date(a.activityDate).getTime() : 0;
          const db = b.activityDate ? new Date(b.activityDate).getTime() : 0;
          return db - da; // Descending
        })
        .slice(0, 20);
    } catch (e) {
      // Non-fatal
    }

    // 4. Identify qualification gaps relative to current stage
    const qualificationFields = [
      { field: "compellingReasonIdentified", label: "Compelling Reason Identified", neededFrom: 2, check: (o) => o.compellingReasonIdentified === true },
      { field: "compellingReasonText", label: "Compelling Reason (Text)", neededFrom: 2, check: (o) => !!o.compellingReasonText && o.compellingReasonText.trim() !== "" },
      { field: "painMonetizedAmount", label: "Pain Monetized Amount", neededFrom: 2, check: (o) => o.painMonetizedAmount?.amountMicros != null && o.painMonetizedAmount.amountMicros > 0 },
      { field: "investmentConversationComplete", label: "Investment Conversation Complete", neededFrom: 3, check: (o) => o.investmentConversationComplete === true },
      { field: "decisionMakerConfirmed", label: "Decision Maker Confirmed", neededFrom: 3, check: (o) => o.decisionMakerConfirmed === true },
      { field: "decisionCriteriaUnderstood", label: "Decision Criteria Understood", neededFrom: 3, check: (o) => o.decisionCriteriaUnderstood === true },
      { field: "timelineAgreed", label: "Timeline Agreed", neededFrom: 3, check: (o) => o.timelineAgreed === true },
      { field: "targetDecisionDate", label: "Target Decision Date", neededFrom: 3, check: (o) => !!o.targetDecisionDate },
      { field: "amount", label: "Deal Amount", neededFrom: 4, check: (o) => o.amount?.amountMicros != null && o.amount.amountMicros > 0 },
      { field: "closeDate", label: "Close Date", neededFrom: 4, check: (o) => !!o.closeDate }
    ];

    // Fields needed for the NEXT stage (or current if gaps exist)
    const nextIdx = Math.min(currentIdx + 1, STAGES.length - 1);
    const relevantFields = qualificationFields.filter(f => f.neededFrom <= nextIdx);
    const completedFields = relevantFields.filter(f => f.check(opp));
    const gapFields = relevantFields.filter(f => !f.check(opp));

    // Also check if current stage has outstanding gaps (Happy Ears scenario)
    const currentStageFields = qualificationFields.filter(f => f.neededFrom <= currentIdx);
    const happyEarsGaps = currentStageFields.filter(f => !f.check(opp));

    // 5. Stakeholder analysis
    const hasDecisionMaker = stakeholders.some(s => s.stakeholderRole === "DECISION_MAKER");
    const hasChampion = stakeholders.some(s => s.stakeholderRole === "CHAMPION" || s.stakeholderRole === "COACH");
    const stakeholderCount = stakeholders.length;
    const unmetStakeholders = stakeholders.filter(s => !s.metDate);

    // 6. Activity analysis
    const lastActivity = activities.length > 0 ? activities[0] : null;
    const daysSinceLastActivity = lastActivity?.activityDate
      ? Math.floor((Date.now() - new Date(lastActivity.activityDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // 7. Generate L.E.A.D.S. coaching questions
    const coaching = {
      Listen: [],
      Empathize: [],
      Ask: [],
      Discuss: [],
      Support: []
    };

    // ── LISTEN: Understanding the rep's perspective ──
    coaching.Listen.push(`Walk me through where you are on "${opp.name}" right now. What happened in your last interaction?`);
    if (daysSinceLastActivity !== null && daysSinceLastActivity > 7) {
      coaching.Listen.push(`It's been ${daysSinceLastActivity} days since your last logged activity. What's been happening off the record?`);
    }
    if (happyEarsGaps.length > 0) {
      coaching.Listen.push(`You're at ${stageLabel} but ${happyEarsGaps.map(g => g.label).join(", ")} ${happyEarsGaps.length === 1 ? "isn't" : "aren't"} confirmed yet. Tell me about those conversations — what did the prospect actually say?`);
    }

    // ── EMPATHIZE: Validate the challenge ──
    if (currentIdx >= 2 && !opp.decisionMakerConfirmed) {
      coaching.Empathize.push("Getting to the real decision maker is one of the hardest parts. What's making it difficult to get that confirmed?");
    }
    if (daysSinceLastActivity !== null && daysSinceLastActivity > 14) {
      coaching.Empathize.push(`Deals that go quiet for ${daysSinceLastActivity} days can feel stuck. What's making this one hard to move forward?`);
    }
    if (gapFields.length > 3) {
      coaching.Empathize.push(`There are ${gapFields.length} qualification gaps to close before the next base. That's a lot to work through — which one feels most daunting?`);
    }
    if (coaching.Empathize.length === 0) {
      coaching.Empathize.push("What part of this deal are you most confident about, and what keeps you up at night?");
    }

    // ── ASK: Probing questions to surface blind spots ──
    if (!opp.compellingReasonIdentified && currentIdx >= 1) {
      coaching.Ask.push("If the prospect does nothing — stays with their current situation — what happens to them in 6 months? Have they told you that in their own words?");
    }
    if (opp.compellingReasonIdentified && (!opp.painMonetizedAmount || opp.painMonetizedAmount?.amountMicros === 0)) {
      coaching.Ask.push("You've identified the compelling reason, but the pain isn't monetized yet. Have you asked the prospect what this problem costs them — in dollars, lost time, risk, or missed revenue?");
    }
    if (!opp.investmentConversationComplete && currentIdx >= 2) {
      coaching.Ask.push("Have you had a real conversation about budget and investment, or are you assuming they can afford this? What range did they confirm?");
    }
    if (!hasDecisionMaker && currentIdx >= 2) {
      coaching.Ask.push("Who will actually sign off on this purchase? Have you met that person, or are you relying on your contact to champion it internally?");
    }
    if (!opp.decisionCriteriaUnderstood && currentIdx >= 2) {
      coaching.Ask.push("What criteria will the prospect use to make this decision? Have you heard them say it, or are you inferring it?");
    }
    if (unmetStakeholders.length > 0) {
      const names = unmetStakeholders.map(s => s._personName || "unknown").join(", ");
      coaching.Ask.push(`You have stakeholders you haven't met yet: ${names}. What's your plan to get face time with them?`);
    }
    if (coaching.Ask.length === 0) {
      coaching.Ask.push("What's the one question you're afraid to ask this prospect? That's usually the most important one.");
    }

    // ── DISCUSS: Strategy and next steps ──
    if (currentIdx === 0) {
      coaching.Discuss.push("What's your plan to get the first meeting booked? Who are you reaching out to, and what's your angle?");
    } else if (currentIdx === 1) {
      coaching.Discuss.push("You've got the meeting. What's your game plan to uncover the compelling reason? What questions will you lead with?");
    } else if (currentIdx === 2) {
      const missingFor3rd = gapFields.filter(g => g.neededFrom <= 3).map(g => g.label);
      if (missingFor3rd.length > 0) {
        coaching.Discuss.push(`To reach 3rd base you still need: ${missingFor3rd.join(", ")}. What's your sequence — which do you tackle next and why?`);
      } else {
        coaching.Discuss.push("You're ready for 3rd base. What's your plan to confirm full qualification and set up the close?");
      }
    } else if (currentIdx === 3) {
      coaching.Discuss.push("You're on 3rd — what specifically needs to happen for this deal to close? Walk me through the closing sequence.");
      if (!opp.closeDate) {
        coaching.Discuss.push("There's no close date set. When is the prospect planning to make the decision, and what did they tell you?");
      }
    }
    if (stakeholderCount === 0 && currentIdx >= 1) {
      coaching.Discuss.push("You have zero stakeholders mapped. Even for smaller deals, knowing who influences the decision is critical. Let's map out the buying committee.");
    } else if (stakeholderCount > 0 && !hasChampion) {
      coaching.Discuss.push("You have stakeholders mapped but no champion or coach identified. Who in that organization is actively pulling for you?");
    }

    // ── SUPPORT: Concrete help the manager can offer ──
    if (!hasDecisionMaker && currentIdx >= 2) {
      coaching.Support.push("Would it help if I joined your next call to help get access to the decision maker? Sometimes an executive-to-executive bridge opens doors.");
    }
    if (daysSinceLastActivity !== null && daysSinceLastActivity > 14) {
      coaching.Support.push("This deal has stalled. Let's draft a re-engagement strategy together — I can help you craft the outreach.");
    }
    if (opp.amount?.amountMicros > 500000 * 1000000) {
      // Large deal (> $500K)
      coaching.Support.push("This is a significant deal. Do you need any additional resources — demo support, technical pre-sales, or executive sponsorship?");
    }
    if (coaching.Support.length === 0) {
      coaching.Support.push("What's the single biggest thing I can do to help you move this deal forward this week?");
    }

    // 8. Build the debrief report
    const debrief = {
      opportunity: {
        name: opp.name,
        id: opp.id,
        stage: currentStage,
        stageLabel,
        company: opp.companyId || null,
        amount: opp.amount?.amountMicros
          ? `$${(opp.amount.amountMicros / 1000000).toLocaleString()}`
          : "Not set",
        closeDate: opp.closeDate || "Not set",
        painMonetized: opp.painMonetizedAmount?.amountMicros
          ? `$${(opp.painMonetizedAmount.amountMicros / 1000000).toLocaleString()}`
          : "Not set"
      },
      diamondPosition: {
        currentBase: currentIdx,
        nextBase: currentIdx < 4 ? STAGE_LABELS[STAGES[nextIdx]] : "Deal Closed",
        qualificationProgress: `${completedFields.length}/${relevantFields.length} fields complete for next base`,
        gaps: gapFields.map(g => g.label),
        happyEarsWarning: happyEarsGaps.length > 0
          ? `⚠ ${happyEarsGaps.length} gap(s) at CURRENT stage: ${happyEarsGaps.map(g => g.label).join(", ")}`
          : null
      },
      stakeholderMap: {
        count: stakeholderCount,
        hasDecisionMaker,
        hasChampion,
        unmetCount: unmetStakeholders.length,
        stakeholders: stakeholders.map(s => ({
          name: s._personName || "Unknown",
          role: s.stakeholderRole || "Not set",
          primaryContact: s.primaryContact || false,
          metDate: s.metDate || "Not met",
          accessConfirmed: s.accessConfirmed || false
        }))
      },
      activityPulse: {
        totalRecentActivities: activities.length,
        daysSinceLastActivity,
        lastActivityType: lastActivity?.activityType || "None",
        lastActivityDate: lastActivity?.activityDate || "None",
        stalled: daysSinceLastActivity !== null && daysSinceLastActivity > 14
      },
      leadsCoaching: coaching
    };

    // 9. Optionally write debrief to Activity Log
    if (writeLog) {
      const diamondBaseMap = {
        0: "NONE",
        1: "FIRST",
        2: "SECOND",
        3: "THIRD",
        4: "HOME_PLATE"
      };

      const summaryLines = [
        `L.E.A.D.S. Debrief — ${opp.name}`,
        `Stage: ${stageLabel}`,
        `Qualification: ${completedFields.length}/${relevantFields.length} for next base`,
        gapFields.length > 0 ? `Gaps: ${gapFields.map(g => g.label).join(", ")}` : "No gaps — ready to advance",
        `Stakeholders: ${stakeholderCount} mapped, ${unmetStakeholders.length} unmet`,
        daysSinceLastActivity !== null ? `Days since last activity: ${daysSinceLastActivity}` : "No prior activity logged"
      ];

      try {
        await this.makeRequest("/rest/activityLogs", "POST", {
          activityType: "LEADS_COACHING_DEBRIEF",
          opportunityId: opp.id,
          companyId: opp.companyId || null,
          activityDate: new Date().toISOString(),
          diamondBaseReached: diamondBaseMap[currentIdx] || "NONE",
          notes: summaryLines.join("\n")
        });
        debrief.logWritten = true;
      } catch (e) {
        debrief.logWritten = false;
        debrief.logError = e.message;
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(debrief, null, 2)
        }
      ]
    };
  }

  // ─── Generate Coaching Artifact (HTML Report) ─────────────────────────────
  async generateCoachingArtifact(params) {
    const { opportunityId } = params;

    // Re-use the debrief engine to get all data
    const debriefResult = await this.coachOpportunityDebrief({ opportunityId, writeLog: false });
    const debriefText = debriefResult.content?.[0]?.text;

    if (!debriefText || debriefText.startsWith("Error:")) {
      return debriefResult; // Pass through errors
    }

    const d = JSON.parse(debriefText);
    const opp = d.opportunity;
    const dp = d.diamondPosition;
    const sm = d.stakeholderMap;
    const ap = d.activityPulse;
    const coaching = d.leadsCoaching;

    // Diamond base visual — which bases are "lit"
    const baseColors = [];
    for (let i = 0; i <= 4; i++) {
      baseColors.push(i <= dp.currentBase ? "#22c55e" : "#374151");
    }

    // Qualification heatmap
    const allFields = [
      "Compelling Reason Identified", "Compelling Reason (Text)", "Pain Monetized Amount",
      "Investment Conversation Complete", "Decision Maker Confirmed", "Decision Criteria Understood",
      "Timeline Agreed", "Target Decision Date", "Deal Amount", "Close Date"
    ];
    const gaps = new Set(dp.gaps || []);

    const fieldHtml = allFields.map(f => {
      const isGap = gaps.has(f);
      const bg = isGap ? "#ef4444" : "#22c55e";
      const icon = isGap ? "✗" : "✓";
      return `<div style="display:inline-block;margin:3px;padding:4px 10px;border-radius:4px;background:${bg};color:#fff;font-size:13px;">${icon} ${f}</div>`;
    }).join("\n");

    // Stakeholder table
    const stakeholderRows = sm.stakeholders.length > 0
      ? sm.stakeholders.map(s => {
          const metBadge = s.metDate !== "Not met"
            ? `<span style="color:#22c55e;">✓ ${s.metDate.slice(0,10)}</span>`
            : `<span style="color:#ef4444;">Not met</span>`;
          const roleBadge = s.role === "DECISION_MAKER"
            ? `<span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">Decision Maker</span>`
            : s.role === "CHAMPION" || s.role === "COACH"
              ? `<span style="background:#8b5cf6;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">${s.role}</span>`
              : `<span style="background:#6b7280;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">${s.role || "Unset"}</span>`;
          return `<tr><td style="padding:6px 12px;">${s.name}</td><td style="padding:6px 12px;">${roleBadge}</td><td style="padding:6px 12px;">${metBadge}</td><td style="padding:6px 12px;">${s.primaryContact ? "★" : ""}</td></tr>`;
        }).join("\n")
      : `<tr><td colspan="4" style="padding:12px;color:#9ca3af;text-align:center;">No stakeholders mapped yet</td></tr>`;

    // L.E.A.D.S. sections
    const leadsHtml = Object.entries(coaching).map(([letter, questions]) => {
      const colors = {
        Listen: "#3b82f6", Empathize: "#8b5cf6", Ask: "#f59e0b",
        Discuss: "#22c55e", Support: "#ef4444"
      };
      const descriptions = {
        Listen: "Understand the rep's perspective before coaching",
        Empathize: "Validate the challenge they're facing",
        Ask: "Probe for blind spots and assumptions",
        Discuss: "Co-create strategy and next steps",
        Support: "Offer concrete help to move the deal forward"
      };
      const qs = questions.map(q => `<li style="margin-bottom:8px;">${q}</li>`).join("\n");
      return `
        <div style="margin-bottom:20px;border-left:4px solid ${colors[letter]};padding-left:16px;">
          <h3 style="margin:0 0 4px 0;color:${colors[letter]};font-size:16px;">${letter[0].toUpperCase()} — ${letter}</h3>
          <p style="margin:0 0 8px 0;color:#9ca3af;font-size:12px;">${descriptions[letter]}</p>
          <ul style="margin:0;padding-left:20px;color:#e5e7eb;">${qs}</ul>
        </div>`;
    }).join("\n");

    // Activity pulse
    const stallBadge = ap.stalled
      ? `<span style="background:#ef4444;color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;">⚠ STALLED (${ap.daysSinceLastActivity} days)</span>`
      : ap.daysSinceLastActivity !== null
        ? `<span style="background:#22c55e;color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;">${ap.daysSinceLastActivity} days ago</span>`
        : `<span style="background:#6b7280;color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;">No activity logged</span>`;

    // Diamond SVG
    const diamondSvg = `
      <svg viewBox="0 0 200 200" width="180" height="180" style="margin:0 auto;display:block;">
        <!-- Diamond outline -->
        <line x1="100" y1="20" x2="180" y2="100" stroke="#4b5563" stroke-width="2"/>
        <line x1="180" y1="100" x2="100" y2="180" stroke="#4b5563" stroke-width="2"/>
        <line x1="100" y1="180" x2="20" y2="100" stroke="#4b5563" stroke-width="2"/>
        <line x1="20" y1="100" x2="100" y2="20" stroke="#4b5563" stroke-width="2"/>
        <!-- Bases -->
        <rect x="90" y="170" width="20" height="20" rx="3" fill="${baseColors[0]}" stroke="#fff" stroke-width="1"/>
        <text x="100" y="200" text-anchor="middle" fill="#9ca3af" font-size="9">HOME</text>
        <rect x="170" y="90" width="20" height="20" rx="3" fill="${baseColors[1]}" stroke="#fff" stroke-width="1"/>
        <text x="180" y="80" text-anchor="middle" fill="#9ca3af" font-size="9">1ST</text>
        <rect x="90" y="10" width="20" height="20" rx="3" fill="${baseColors[2]}" stroke="#fff" stroke-width="1"/>
        <text x="100" y="8" text-anchor="middle" fill="#9ca3af" font-size="9">2ND</text>
        <rect x="10" y="90" width="20" height="20" rx="3" fill="${baseColors[3]}" stroke="#fff" stroke-width="1"/>
        <text x="20" y="80" text-anchor="middle" fill="#9ca3af" font-size="9">3RD</text>
        <!-- Runner indicator -->
        ${dp.currentBase === 0 ? '<circle cx="100" cy="180" r="6" fill="#fbbf24" stroke="#fff" stroke-width="2"/>' : ''}
        ${dp.currentBase === 1 ? '<circle cx="180" cy="100" r="6" fill="#fbbf24" stroke="#fff" stroke-width="2"/>' : ''}
        ${dp.currentBase === 2 ? '<circle cx="100" cy="20" r="6" fill="#fbbf24" stroke="#fff" stroke-width="2"/>' : ''}
        ${dp.currentBase === 3 ? '<circle cx="20" cy="100" r="6" fill="#fbbf24" stroke="#fff" stroke-width="2"/>' : ''}
        ${dp.currentBase === 4 ? '<text x="100" y="110" text-anchor="middle" fill="#fbbf24" font-size="24">🏆</text>' : ''}
      </svg>`;

    // Assemble full HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Coaching Debrief — ${opp.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111827; color: #e5e7eb; padding: 24px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 4px; color: #fff; }
  h2 { font-size: 17px; margin: 24px 0 12px 0; color: #d1d5db; border-bottom: 1px solid #374151; padding-bottom: 6px; }
  .card { background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .stat { font-size: 13px; color: #9ca3af; }
  .stat-value { font-size: 18px; color: #fff; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 8px 12px; color: #9ca3af; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #374151; }
  td { border-bottom: 1px solid #1f2937; }
  .happy-ears { background: #7f1d1d; border: 1px solid #ef4444; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; color: #fca5a5; font-size: 13px; }
  .timestamp { color: #6b7280; font-size: 11px; margin-top: 24px; text-align: center; }
  @media print { body { background: #fff; color: #111; } .card { border: 1px solid #ddd; background: #f9f9f9; } }
</style>
</head>
<body>
  <h1>🔷 Coaching Debrief — ${opp.name}</h1>
  <p style="color:#9ca3af;margin-bottom:20px;">Generated ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

  <div class="grid2">
    <div class="card" style="text-align:center;">
      <h2 style="margin-top:0;border:none;padding:0;">Diamond Position</h2>
      ${diamondSvg}
      <p style="margin-top:8px;font-size:15px;color:#fbbf24;font-weight:600;">${opp.stageLabel}</p>
      <p style="font-size:12px;color:#9ca3af;">Next: ${dp.nextBase}</p>
    </div>
    <div class="card">
      <h2 style="margin-top:0;border:none;padding:0;">Deal Snapshot</h2>
      <div style="margin-bottom:10px;"><span class="stat">Deal Amount</span><br><span class="stat-value">${opp.amount}</span></div>
      <div style="margin-bottom:10px;"><span class="stat">Pain Monetized</span><br><span class="stat-value">${opp.painMonetized}</span></div>
      <div style="margin-bottom:10px;"><span class="stat">Close Date</span><br><span class="stat-value">${opp.closeDate}</span></div>
      <div><span class="stat">Last Activity</span><br>${stallBadge}</div>
    </div>
  </div>

  ${dp.happyEarsWarning ? `<div class="happy-ears">${dp.happyEarsWarning}</div>` : ""}

  <h2>Qualification Heatmap</h2>
  <div class="card">
    <p style="margin-bottom:8px;font-size:13px;color:#9ca3af;">${dp.qualificationProgress}</p>
    ${fieldHtml}
  </div>

  <h2>Stakeholder Map</h2>
  <div class="card">
    <table>
      <thead><tr><th>Name</th><th>Role</th><th>Met</th><th>Primary</th></tr></thead>
      <tbody>${stakeholderRows}</tbody>
    </table>
  </div>

  <h2>L.E.A.D.S. Coaching Questions</h2>
  <div class="card">
    ${leadsHtml}
  </div>

  <p class="timestamp">Kurlan/Rosen Methodology • Generated by Twenty CRM MCP</p>
</body>
</html>`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            opportunityId: opp.id,
            opportunityName: opp.name,
            stage: opp.stageLabel,
            htmlLength: html.length,
            html
          }, null, 2)
        }
      ]
    };
  }

  // ─── Bulk Field Update ────────────────────────────────────────────────────
  async bulkFieldUpdate(params) {
    const { filter, field, value, dryRun = true } = params;

    // 1. Fetch all opportunities (paginated)
    let allOpps = [];
    let offset = 0;
    const limit = 60;
    while (true) {
      const result = await this.makeRequest(`/rest/opportunities?limit=${limit}&offset=${offset}`);
      const page = result.data?.opportunities || result.data || [];
      const items = Array.isArray(page) ? page : [];
      if (items.length === 0) break;
      allOpps = allOpps.concat(items);
      if (items.length < limit) break;
      offset += limit;
    }

    // 2. Apply filters
    let matched = [...allOpps];

    if (filter.stage) {
      matched = matched.filter(o => o.stage === filter.stage);
    }

    if (filter.companyId) {
      matched = matched.filter(o => o.companyId === filter.companyId);
    }

    if (filter.hasAmount === true) {
      matched = matched.filter(o => o.amount?.amountMicros != null && o.amount.amountMicros > 0);
    } else if (filter.hasAmount === false) {
      matched = matched.filter(o => !o.amount?.amountMicros || o.amount.amountMicros === 0);
    }

    // Stall filter — need activity logs
    if (filter.stallDaysMin != null) {
      let allActivities = [];
      let actOffset = 0;
      while (true) {
        const actResult = await this.makeRequest(`/rest/activityLogs?limit=60&offset=${actOffset}`);
        const actPage = actResult.data?.activityLogs || actResult.data || [];
        const actItems = Array.isArray(actPage) ? actPage : [];
        if (actItems.length === 0) break;
        allActivities = allActivities.concat(actItems);
        if (actItems.length < 60) break;
        actOffset += 60;
      }

      const lastActivityByOpp = {};
      for (const act of allActivities) {
        if (act.opportunityId) {
          const existing = lastActivityByOpp[act.opportunityId];
          if (!existing || new Date(act.activityDate) > new Date(existing)) {
            lastActivityByOpp[act.opportunityId] = act.activityDate;
          }
        }
      }

      const now = Date.now();
      matched = matched.filter(o => {
        const lastDate = lastActivityByOpp[o.id];
        if (!lastDate) return true; // No activity = definitely stalled
        const daysSince = Math.floor((now - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= filter.stallDaysMin;
      });
    }

    // 3. Build the update payload
    const updatePayload = { [field]: value };

    // 4. Dry run or execute
    const results = {
      mode: dryRun ? "DRY_RUN" : "EXECUTE",
      totalOpportunities: allOpps.length,
      matchedCount: matched.length,
      filter,
      field,
      value,
      matched: matched.map(o => ({
        id: o.id,
        name: o.name,
        stage: o.stage,
        currentValue: o[field]
      })),
      updated: [],
      errors: []
    };

    if (!dryRun) {
      for (const opp of matched) {
        try {
          await this.makeRequest(`/rest/opportunities/${opp.id}`, "PATCH", updatePayload);
          results.updated.push({ id: opp.id, name: opp.name, status: "OK" });
        } catch (e) {
          results.errors.push({ id: opp.id, name: opp.name, error: e.message });
        }
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  // ─── Add Schema Field (Metadata API) ──────────────────────────────────────
  async addSchemaField(params) {
    const { objectName, fieldName, label, type, description = "", icon = "", options = null } = params;

    // Twenty metadata API uses GraphQL at /metadata
    const mutation = `
      mutation CreateOneField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
          label
          type
          description
          icon
          isCustom
          isActive
          createdAt
        }
      }
    `;

    // Build the field input
    const fieldInput = {
      name: fieldName,
      label,
      type,
      description,
      icon: icon || undefined,
      objectMetadataId: null // We need to look this up first
    };

    // Step 1: Find the objectMetadataId for the given objectName
    // Try the proven REST metadata endpoint first, then fall back to GraphQL
    let objectId = null;
    try {
      const restMeta = await this.makeRequest("/rest/metadata/objects");
      // REST metadata returns an array of objects (or nested in .data)
      const objects = restMeta.data?.objects || restMeta.objects || (Array.isArray(restMeta) ? restMeta : []);

      // Handle both flat array and edges/node GraphQL-style responses
      let match = null;
      if (Array.isArray(objects)) {
        match = objects.find(o =>
          o.nameSingular === objectName || o.namePlural === objectName ||
          o.nameSingular === objectName.toLowerCase() || o.namePlural === objectName.toLowerCase()
        );
      } else if (objects.edges) {
        const edge = objects.edges.find(e =>
          e.node.nameSingular === objectName || e.node.namePlural === objectName ||
          e.node.nameSingular === objectName.toLowerCase() || e.node.namePlural === objectName.toLowerCase()
        );
        if (edge) match = edge.node;
      }

      if (match) {
        objectId = match.id;
      }
    } catch (e) {
      // Fall back to GraphQL metadata endpoint
      try {
        const gqlQuery = `query { objects(paging: { first: 100 }) { edges { node { id nameSingular namePlural } } } }`;
        const gqlResult = await this.makeRequest("/metadata", "POST", { query: gqlQuery });
        const edges = gqlResult.data?.objects?.edges || [];
        const edge = edges.find(e =>
          e.node.nameSingular === objectName || e.node.namePlural === objectName ||
          e.node.nameSingular === objectName.toLowerCase() || e.node.namePlural === objectName.toLowerCase()
        );
        if (edge) objectId = edge.node.id;
      } catch (e2) {
        return {
          content: [{ type: "text", text: `Error fetching object metadata (tried REST and GraphQL): REST: ${e.message}, GraphQL: ${e2.message}` }]
        };
      }
    }

    if (!objectId) {
      return {
        content: [{ type: "text", text: `Error: Object "${objectName}" not found in metadata. Use get_metadata_objects to see available objects.` }]
      };
    }

    fieldInput.objectMetadataId = objectId;

    // Step 2: Add options for SELECT/MULTI_SELECT
    if (options && (type === "SELECT" || type === "MULTI_SELECT")) {
      fieldInput.options = options;
    }

    // Step 3: Create the field
    try {
      const createResult = await this.makeRequest("/metadata", "POST", {
        query: mutation,
        variables: {
          input: { field: fieldInput }
        }
      });

      const createdField = createResult.data?.createOneField;

      if (createdField) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Field "${label}" (${fieldName}) created on ${objectName}`,
                field: createdField
              }, null, 2)
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "Field creation returned no data — check for GraphQL errors",
                raw: createResult
              }, null, 2)
            }
          ]
        };
      }
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error creating field: ${e.message}` }]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Twenty CRM MCP server running on stdio");
  }
}

const server = new TwentyCRMServer();
server.run().catch(console.error);