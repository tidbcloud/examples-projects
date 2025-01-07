import type { Primitive } from "zod";

interface BaseResult {
  code: number;
  msg: string;
}

export interface GenerateDataSummaryResult extends BaseResult {
  result: {
    data_summary_id: number;
    job_id: string;
  };
}

export interface JobResult<T> extends BaseResult {
  result: {
    ended_at: number;
    job_id: string;
    status: "init" | "running" | "failed" | "done";
    reason: string;
    result: T | null;
  };
}

export interface DataSummary {
  cluster_id: string;
  data_summary_id: number;
  database: string;
  default: boolean;
  status: "done" | "failed";
  description: {
    system: string;
    user: string;
  };
  keywords: string[];
  relationships: Record<
    string,
    Array<{
      referenced_table: string;
      referenced_table_column: string;
      referencing_table: string;
      referencing_table_column: string;
    }>
  >;
  summary: string;
  tables: Record<
    string,
    {
      columns: Record<
        string,
        {
          name: string;
          description: string;
        }
      >;
      description: string;
      name: string;
    }
  >;
}

export interface Chat2DataResult extends BaseResult {
  result: {
    cluster_id: string;
    database: string;
    job_id: string;
    session_id: number;
  };
}

interface Assumption {
  concept: string;
  explanation: string;
}

export interface AskResult extends BaseResult {
  assumptions: Assumption[];
  clarified_task: string;
  data: {
    columns: { col: string }[] | null;
    rows: Primitive[][] | null;
  };
  description: string;
  sql: string;
  sql_error: string | null;
  status: "done" | "failed";
  task_id: string;
  type: "data_retrieval";
}

export class Chat2Query {
  private headers: HeadersInit;
  private baseUrl: string;
  private clusterId: string;
  private database: string;

  constructor(options: {
    publicKey: string;
    privateKey: string;
    baseUrl: string;
    clusterId: string;
    database: string;
  }) {
    const { publicKey, privateKey, baseUrl, clusterId, database } = options;
    this.baseUrl = baseUrl;
    this.clusterId = clusterId;
    this.database = database;

    const authString = btoa(`${publicKey}:${privateKey}`);
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP status: ${response.status}, ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  }

  async generateDataSummary() {
    return this.request<GenerateDataSummaryResult>("/v3/dataSummaries", {
      method: "POST",
      body: JSON.stringify({
        cluster_id: this.clusterId,
        database: this.database,
        reuse: true,
        default: true,
        description: "",
      }),
    });
  }

  async getJobResult<T>(jobId: string) {
    while (true) {
      const jobResult = await this.request<JobResult<T>>(`/v2/jobs/${jobId}`);
      if (
        jobResult.result.status === "done" ||
        jobResult.result.status === "failed"
      ) {
        return jobResult;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  async chat2data(question: string) {
    return this.request<Chat2DataResult>("/v3/chat2data", {
      method: "POST",
      body: JSON.stringify({
        cluster_id: this.clusterId,
        database: this.database,
        question,
        sql_generate_mode: "direct",
      }),
    });
  }

  async getDataSummary() {
    const job = await this.generateDataSummary();
    return await this.getJobResult<DataSummary>(job.result.job_id);
  }

  async ask(question: string) {
    const job = await this.chat2data(question);
    return await this.getJobResult<AskResult>(job.result.job_id);
  }
}
