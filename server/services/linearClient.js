import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Linear API Client
 * Modern issue tracking and project management
 *
 * @see https://developers.linear.app/docs/graphql/working-with-the-graphql-api
 */
class LinearClient {
  constructor() {
    this.baseURL = 'https://api.linear.app/graphql';
    this.apiKey = process.env.LINEAR_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️ LINEAR_API_KEY not configured. Linear API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.LINEAR_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => {
        if (response.data.errors) {
          throw new Error(response.data.errors[0].message);
        }
        return response;
      },
      error => {
        const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
        console.error('Linear API Error:', errorMsg);
        throw new Error(`Linear API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Query result
   */
  async query(query, variables = {}) {
    const response = await this.client.post('', { query, variables });
    return response.data.data;
  }

  // ==================== Issues ====================

  /**
   * Create an issue
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(issueData) {
    const mutation = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state { name }
            priority
            assignee { name }
            createdAt
            url
          }
        }
      }
    `;
    const result = await this.query(mutation, { input: issueData });
    return result.issueCreate;
  }

  /**
   * Get an issue
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(issueId) {
    const query = `
      query Issue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state { id name }
          priority
          priorityLabel
          assignee { id name email }
          creator { id name }
          project { id name }
          team { id name key }
          labels { nodes { id name color } }
          comments { nodes { id body user { name } createdAt } }
          createdAt
          updatedAt
          url
        }
      }
    `;
    const result = await this.query(query, { id: issueId });
    return result.issue;
  }

  /**
   * Update an issue
   * @param {string} issueId - Issue ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated issue
   */
  async updateIssue(issueId, updateData) {
    const mutation = `
      mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            state { name }
            priority
            url
          }
        }
      }
    `;
    const result = await this.query(mutation, { id: issueId, input: updateData });
    return result.issueUpdate;
  }

  /**
   * Delete an issue
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteIssue(issueId) {
    const mutation = `
      mutation IssueDelete($id: String!) {
        issueDelete(id: $id) {
          success
        }
      }
    `;
    const result = await this.query(mutation, { id: issueId });
    return result.issueDelete;
  }

  /**
   * Search issues
   * @param {Object} filter - Filter options
   * @param {number} first - Number of results
   * @returns {Promise<Object>} Search results
   */
  async searchIssues(filter = {}, first = 50) {
    const query = `
      query Issues($filter: IssueFilter, $first: Int) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            title
            description
            state { name }
            priority
            priorityLabel
            assignee { name }
            team { name key }
            createdAt
            url
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    const result = await this.query(query, { filter, first });
    return result.issues;
  }

  // ==================== Comments ====================

  /**
   * Add a comment to an issue
   * @param {string} issueId - Issue ID
   * @param {string} body - Comment body (markdown)
   * @returns {Promise<Object>} Created comment
   */
  async addComment(issueId, body) {
    const mutation = `
      mutation CommentCreate($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id
            body
            user { name }
            createdAt
          }
        }
      }
    `;
    const result = await this.query(mutation, { input: { issueId, body } });
    return result.commentCreate;
  }

  // ==================== Teams ====================

  /**
   * Get all teams
   * @returns {Promise<Object>} Teams
   */
  async getTeams() {
    const query = `
      query Teams {
        teams {
          nodes {
            id
            name
            key
            description
            states { nodes { id name type } }
            labels { nodes { id name color } }
          }
        }
      }
    `;
    const result = await this.query(query);
    return result.teams;
  }

  /**
   * Get team
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Team details
   */
  async getTeam(teamId) {
    const query = `
      query Team($id: String!) {
        team(id: $id) {
          id
          name
          key
          description
          states { nodes { id name type } }
          labels { nodes { id name color } }
          members { nodes { id name email } }
        }
      }
    `;
    const result = await this.query(query, { id: teamId });
    return result.team;
  }

  // ==================== Projects ====================

  /**
   * Get all projects
   * @param {number} first - Number of results
   * @returns {Promise<Object>} Projects
   */
  async getProjects(first = 50) {
    const query = `
      query Projects($first: Int) {
        projects(first: $first) {
          nodes {
            id
            name
            description
            state
            progress
            startDate
            targetDate
            teams { nodes { name } }
            lead { name }
            url
          }
        }
      }
    `;
    const result = await this.query(query, { first });
    return result.projects;
  }

  /**
   * Get project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectId) {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          id
          name
          description
          state
          progress
          startDate
          targetDate
          issues { nodes { id identifier title state { name } } }
          teams { nodes { id name } }
          lead { id name }
          url
        }
      }
    `;
    const result = await this.query(query, { id: projectId });
    return result.project;
  }

  // ==================== Cycles (Sprints) ====================

  /**
   * Get cycles for a team
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Cycles
   */
  async getCycles(teamId) {
    const query = `
      query Cycles($filter: CycleFilter) {
        cycles(filter: $filter) {
          nodes {
            id
            name
            number
            startsAt
            endsAt
            progress
            issues { nodes { id identifier title } }
          }
        }
      }
    `;
    const result = await this.query(query, { filter: { team: { id: { eq: teamId } } } });
    return result.cycles;
  }

  // ==================== Users ====================

  /**
   * Get current user
   * @returns {Promise<Object>} Current user
   */
  async getCurrentUser() {
    const query = `
      query Me {
        viewer {
          id
          name
          email
          displayName
          avatarUrl
          teams { nodes { id name key } }
        }
      }
    `;
    const result = await this.query(query);
    return result.viewer;
  }

  /**
   * Get all users
   * @returns {Promise<Object>} Users
   */
  async getUsers() {
    const query = `
      query Users {
        users {
          nodes {
            id
            name
            email
            displayName
            active
          }
        }
      }
    `;
    const result = await this.query(query);
    return result.users;
  }

  // ==================== Labels ====================

  /**
   * Get all labels
   * @returns {Promise<Object>} Labels
   */
  async getLabels() {
    const query = `
      query Labels {
        issueLabels {
          nodes {
            id
            name
            color
            description
            team { name }
          }
        }
      }
    `;
    const result = await this.query(query);
    return result.issueLabels;
  }

  // ==================== Workflow States ====================

  /**
   * Get workflow states
   * @param {string} teamId - Team ID (optional)
   * @returns {Promise<Object>} Workflow states
   */
  async getWorkflowStates(teamId) {
    const query = `
      query WorkflowStates($filter: WorkflowStateFilter) {
        workflowStates(filter: $filter) {
          nodes {
            id
            name
            type
            color
            position
            team { name }
          }
        }
      }
    `;
    const filter = teamId ? { team: { id: { eq: teamId } } } : undefined;
    const result = await this.query(query, { filter });
    return result.workflowStates;
  }
}

export const linearClient = new LinearClient();
export default LinearClient;
