interface CronJob {
  enabled: boolean;
  folderId: number;
  jobId: number;
  lastDuration: number;
  lastExecution: number;
  lastStatus: number;
  nextExecution: number;
  redirectSuccess: boolean;
  requestMethod: number;
  requestTimeout: number;
  saveResponses: boolean;
  schedule: CronJobSchedule;
  title: string;
  type: number;
  url: string;
}

interface CronJobSchedule {
  expiresAt: number;
  hours: number[];
  mdays: number[];
  minutes: number[];
  months: number[];
  timezone: string;
  wdays: number[];
}

interface CronJobListResponse {
  jobs: CronJob[];
  someFailed: boolean;
}

interface CronJobDetailsResponse {
  jobDetails: CronJob;
}
